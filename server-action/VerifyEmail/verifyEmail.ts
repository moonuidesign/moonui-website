import { users } from '@/db/migration/schema';
import { unstable_update } from '@/libs/auth';
import { db } from '@/libs/drizzle';
import redis from '@/libs/redis-local';
import { ResponseAction } from '@/types/response-action';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import z from 'zod';

const verifyEmailSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  otp: z
    .string()
    .min(6, { message: 'Your verification code must be 6 characters.' }),
});
type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
/***
 * Memverifikasi OTP dari Redis dan menandai email sebagai terverifikasi.
 */

const getEmailVerificationOtpKey = (email: string) =>
  `email-verify-otp:${email}`;

export async function verifyEmail(
  data: VerifyEmailSchema,
): Promise<ResponseAction<null>> {
  const result = verifyEmailSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return { code: 400, success: false, message: errors.join(', ') };
  }

  const { email, otp } = result.data;
  const redisKey = getEmailVerificationOtpKey(email);

  try {
    const storedOtp = await redis.get(redisKey);
    if (!storedOtp) {
      return {
        code: 400,
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      };
    }
    if (storedOtp !== otp) {
      return {
        code: 400,
        success: false,
        message: 'The verification code is incorrect.',
      };
    }

    // OTP benar, lanjutkan verifikasi di database
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return { code: 404, success: false, message: 'User not found.' };
    }

    const newEmailVerifiedDate = new Date();
    await db
      .update(users)
      .set({ emailVerified: newEmailVerifiedDate })
      .where(eq(users.id, user.id));
    await redis.del(redisKey);

    revalidatePath('/verify-email/otp');
    revalidatePath('/');
    await unstable_update({ user: { emailVerified: newEmailVerifiedDate } });

    return {
      code: 200,
      success: true,
      message: 'Your email has been verified successfully.',
      data: null,
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred while verifying your email.',
    };
  }
}
