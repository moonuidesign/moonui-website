import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import z from 'zod';
import bcrypt from 'bcryptjs';
import { desc, eq } from 'drizzle-orm';
import {
  accounts,
  licenses,
  sessions,
  users,
  verificationTokens,
} from '@/db/migration';
import { activateLicense } from '@/server-action/Activate/activate';
import { cookies } from 'next/headers';
import { getUserFromDb } from './db';
import { db } from './drizzle';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
const ACTIVATION_COOKIE = 'ls_activation_key';

// --- HELPER FUNCTION: Get Tier ---
// Mengambil tier dari license yang aktif
const getTierFromDb = async (userId: string): Promise<'free' | 'pro'> => {
  try {
    // Cek license aktif terlebih dahulu
    const userLicenseData = await db
      .select()
      .from(licenses)
      .where(eq(licenses.userId, userId))
      .orderBy(desc(licenses.createdAt))
      .limit(1);

    const currentLicense = userLicenseData[0];

    console.log(`[getTierFromDb] User: ${userId}, License found:`, currentLicense ? {
      status: currentLicense.status,
      planType: currentLicense.planType,
      tier: currentLicense.tier,
      expiresAt: currentLicense.expiresAt,
    } : 'None');

    if (!currentLicense) {
      console.log(`[getTierFromDb] No license found for user ${userId}, returning 'free'`);
      return 'free';
    }

    // Jika ada license dengan tier 'pro' dan status 'active'
    if (currentLicense.status === 'active') {
      const now = new Date();

      // Untuk one_time license (lifetime), tidak ada expiresAt
      if (currentLicense.planType === 'one_time') {
        console.log(`[getTierFromDb] User ${userId} has lifetime license, returning 'pro'`);
        return 'pro';
      }

      // Untuk subscribe, cek expiry
      if (currentLicense.expiresAt && currentLicense.expiresAt > now) {
        console.log(`[getTierFromDb] User ${userId} has active subscription, returning 'pro'`);
        return 'pro';
      }

      // Subscribe tapi expiresAt null (anggap selamanya aktif untuk kasus edge case)
      if (!currentLicense.expiresAt) {
        console.log(`[getTierFromDb] User ${userId} has subscription without expiry, returning 'pro'`);
        return 'pro';
      }
    }

    console.log(`[getTierFromDb] User ${userId} license not valid, returning 'free'`);
    return 'free';
  } catch (error) {
    console.error('[getTierFromDb] Error:', error);
    return 'free';
  }
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  ...authConfig,
  trustHost: true,
  // debug: true, // Matikan debug jika sudah production agar log bersih
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: THIRTY_DAYS_IN_SECONDS,
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember Me', type: 'boolean' },
      },
      authorize: async (credentials) => {
        try {
          const parsedCredentials = z
            .object({
              email: z.string().email(),
              password: z.string().min(6),
              rememberMe: z
                .union([z.boolean(), z.string()])
                .transform((v) => v === true || v === 'true')
                .optional(),
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) return null;
          const { email, password } = parsedCredentials.data;

          const user = await getUserFromDb(email);
          if (!user || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (isPasswordValid) {
            // ✅ FETCH TIER DI SINI (Hanya 1x saat login credentials)
            // Ini mencegah query berulang di JWT callback
            const tier = await getTierFromDb(user.id);

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              roleUser: user.roleUser,
              tier: tier,
              rememberMe: parsedCredentials.data.rememberMe ?? false,
            };
          }
          return null;
        } catch (error) {
          console.error('[Auth] Authorize Logic Error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.emailVerified = user.emailVerified;
        token.roleUser = (user as any).roleUser ?? 'user';
        token.rememberMe = (user as any).rememberMe ?? false;

        if ((user as any).tier) {
          token.tier = (user as any).tier;
        } else {
          token.tier = await getTierFromDb(user.id!);
        }
      }
      if (trigger === 'update') {
        token.tier = await getTierFromDb(token.id as string);

        return { ...token, ...session };
      }

      return token;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const checkVerified = await getUserFromDb(user.email!);
        if (checkVerified && !checkVerified.emailVerified) {
          await db
            .update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.id, checkVerified.id));
        }

        const activationCookie = (await cookies()).get(ACTIVATION_COOKIE);
        if (activationCookie) {
          try {
            const { licenseKey, email, tier, planType, orderId } = JSON.parse(
              activationCookie.value,
            );
            if (user.email === email) {
              await activateLicense(
                licenseKey,
                user.id!,
                tier || 'pro',
                planType || 'subscribe',
                orderId || 0,
              );
            }
          } catch (error) {
            console.error('GOOGLE_SIGNIN_ACTIVATION_ERROR', error);
          } finally {
            (await cookies()).delete(ACTIVATION_COOKIE);
          }
        }
        return true;
      }

      const dbUser = await getUserFromDb(user.email!);
      if (!dbUser) return false;

      return true;
    },

    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.roleUser = token.roleUser as 'admin' | 'user';
        if (token.tier) {
          (session.user as any).tier = token.tier;
        }
      }
      return session;
    },
  },
});
