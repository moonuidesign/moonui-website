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

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  ...authConfig,
  trustHost: true,
  debug: true, // Biarkan true dulu untuk debugging
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
        // Logika verifikasi password (tidak diubah, ini sudah benar)
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
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              roleUser: user.roleUser,
              tier: 'free',
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

        try {
          const dbUser = await getUserFromDb(user.email!);
          token.roleUser = dbUser?.roleUser ?? 'user';
          token.tier = (user as any).tier ?? 'free';
          token.rememberMe = (user as any).rememberMe ?? false;
        } catch (e) {
          token.roleUser = 'user';
          token.tier = 'free';
        }
      }

      // Update Tier Logic (Hanya jika token sudah ada ID)
      if (token.id) {
        try {
          const userLicenseData = await db
            .select()
            .from(licenses)
            .where(eq(licenses.userId, token.id))
            .orderBy(desc(licenses.createdAt))
            .limit(1);

          const currentLicense = userLicenseData[0];
          const now = new Date();

          const isValid =
            currentLicense &&
            currentLicense.status === 'active' &&
            currentLicense.expiresAt &&
            currentLicense.expiresAt > now;

          token.tier = isValid ? currentLicense.tier : 'free';
        } catch (error) {
          console.error('Error fetching tier in JWT callback:', error);
          if (!token.tier) token.tier = 'free';
        }
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },

    async signIn({ user, account }) {
      // 1. Logika Google & Aktivasi License
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
            const { licenseKey, email } = JSON.parse(activationCookie.value);
            if (user.email === email) {
              await activateLicense(licenseKey, user.id!);
            }
          } catch (error) {
            console.error('GOOGLE_SIGNIN_ACTIVATION_ERROR', error);
            // Tetap return true agar user bisa login meski aktivasi gagal
          } finally {
            (await cookies()).delete(ACTIVATION_COOKIE);
          }
        }
        return true; // PENTING: Jangan return path URL
      }

      // 2. Logika Credentials Check
      const dbUser = await getUserFromDb(user.email!);
      if (!dbUser) return false;

      // PENTING: HAPUS SEMUA LOGIKA REDIRECT DI SINI
      // Biarkan authConfig (Middleware) yang mengatur routing
      // setelah cookie session berhasil dibuat.

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
