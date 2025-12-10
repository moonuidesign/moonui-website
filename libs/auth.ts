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
} from '@/db/migration/schema';
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
              rememberMe: z.boolean().optional(),
            })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            throw new Error('Invalid credentials format');
          }
          const { email, password } = parsedCredentials.data;
          const user = await getUserFromDb(email);
          if (!user || !user.password) {
            return null;
          }
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

        // SAFEGUARD: Bungkus DB call ini dengan try-catch agar auth tidak crash total
        try {
          const dbUser = await getUserFromDb(user.email!);
          token.roleUser = dbUser?.roleUser ?? 'user';
          // Set default tier & rememberMe dari input user awal
          token.tier = (user as any).tier ?? 'free';
          token.rememberMe = (user as any).rememberMe ?? false;
        } catch (e) {
          console.error('Error fetching initial user data:', e);
          token.roleUser = 'user';
          token.tier = 'free';
        }
      }

      // LOGIKA UPDATE TIER (Hanya jalankan jika ada token.id)
      if (token.id) {
        try {
          // Ambil lisensi terakhir user
          const userLicenseData = await db
            .select()
            .from(licenses)
            .where(eq(licenses.userId, token.id))
            .orderBy(desc(licenses.createdAt))
            .limit(1);

          const currentLicense = userLicenseData[0];
          const now = new Date();

          // Cek Validitas
          const isValid =
            currentLicense &&
            currentLicense.status === 'active' &&
            currentLicense.expiresAt &&
            currentLicense.expiresAt > now;

          if (isValid) {
            token.tier = currentLicense.tier;
          } else {
            token.tier = 'free';
          }
        } catch (error) {
          // PENTING: Jangan throw error disini, cukup log saja
          // Jika throw, akan menyebabkan JWTSessionError di frontend
          console.error('Error fetching tier in JWT callback:', error);
          // Fallback ke free jika database bermasalah
          if (!token.tier) token.tier = 'free';
        }
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
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
            const { licenseKey, email } = JSON.parse(activationCookie.value);

            // Pastikan email dari cookie cocok dengan email pengguna yang login
            if (user.email === email) {
              await activateLicense(licenseKey, user.id!);
              console.log(
                `License ${licenseKey} activated for Google user ${user.id}`,
              );
            }
          } catch (error) {
            console.error('GOOGLE_SIGNIN_ACTIVATION_ERROR', error);
            // Kembalikan false untuk menghentikan proses sign-in jika aktivasi wajib dan gagal
            return false;
          } finally {
            // Selalu hapus cookie setelah dicoba
            (await cookies()).delete(ACTIVATION_COOKIE);
          }
        }
      }
      const dbUser = await getUserFromDb(user.email!);
      if (!dbUser) return false;
      const userRole = dbUser.roleUser ?? 'user';

      if (userRole === 'superadmin' || userRole === 'admin') {
        return '/admin/dashboard';
      } else if (userRole === 'user') {
        // Cek lisensi untuk redirect
        const userLicense = await db
          .select()
          .from(licenses)
          .where(eq(licenses.userId, dbUser.id))
          .orderBy(desc(licenses.createdAt))
          .limit(1);

        const currentLicense = userLicense[0];
        const now = new Date();
        const isLicenseInvalid =
          !currentLicense ||
          currentLicense.status !== 'active' ||
          (currentLicense.expiresAt && currentLicense.expiresAt < now);

        if (isLicenseInvalid) return '/coba';
        return '/dashboard';
      }
      return true;
    },

    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id;
        session.user.emailVerified = token.emailVerified as Date | null;

        session.user.roleUser = token.roleUser as 'admin' | 'user';
      }
      return session;
    },
  },
});
