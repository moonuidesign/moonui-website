import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

import z from 'zod';
import { db, getUserFromDb } from './db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from '@/db/migration/schema';

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

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
              generate: user.generate ?? 0,
              image: user.image,
              rememberMe: parsedCredentials.data.rememberMe,
            };
          }

          return null;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.emailVerified = user.emailVerified;
        token.generate = user.generate ?? 0;
        // Fetch roleUser from database when user logs in
        const dbUser = await getUserFromDb(user.email!);
        token.roleUser = dbUser?.roleUser ?? 'user';
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
      }
      return true;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.generate = token.generate;
        session.user.roleUser = token.roleUser as 'admin' | 'user';
      }
      return session;
    },
  },
});
