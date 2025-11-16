import redis from '@/libs/redis-local';
import { verifyResetPasswordSignature } from '@/libs/signature';
import { ResponseAction } from '@/types/response-action';
import z from 'zod';

const actionVerificationOTPSchema = z.object({
  otp: z.string().min(6, { message: 'OTP must be 6 characters.' }),
  signature: z.string().min(1, { message: 'Signature is required.' }),
});
type ActionVerificationOTPSchema = z.infer<typeof actionVerificationOTPSchema>;
const getPasswordResetOtpKey = (email: string) => `password-reset-otp:${email}`;

export async function verifyOTPForgotPassword(
  data: ActionVerificationOTPSchema,
): Promise<ResponseAction<null>> {
  const result = actionVerificationOTPSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return { code: 400, success: false, message: errors.join(', ') };
  }

  const { otp, signature } = result.data;

  try {
    const { payload, valid, expired } = await verifyResetPasswordSignature(
      signature,
    );

    if (!valid || !payload) {
      return {
        code: 400,
        success: false,
        message: 'The signature is not valid.',
      };
    }
    if (expired) {
      return {
        code: 400,
        success: false,
        message: 'Your request has expired. Please try again.',
      };
    }

    const redisKey = getPasswordResetOtpKey(payload.email);
    const storedOtp = await redis.get(redisKey);

    if (!storedOtp) {
      return {
        code: 400,
        success: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    if (otp !== payload.otp || otp !== storedOtp) {
      return {
        code: 400,
        success: false,
        message: 'The OTP code is incorrect.',
      };
    }

    await redis.del(redisKey);

    return {
      code: 200,
      success: true,
      message: 'OTP verified successfully.',
      data: null,
      url: signature,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred while verifying the OTP.',
    };
  }
}
