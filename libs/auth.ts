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

// --- HELPER FUNCTION: Get License Status ---
// Returns 'active' | 'expired' | 'none' for use in session
export const getLicenseStatusFromDb = async (userId: string): Promise<'active' | 'expired' | 'none'> => {
  try {
    const userLicenseData = await db
      .select()
      .from(licenses)
      .where(eq(licenses.userId, userId))
      .orderBy(desc(licenses.createdAt))
      .limit(1);

    const currentLicense = userLicenseData[0];

    if (!currentLicense) {
      return 'none';
    }

    // Check if license is expired
    const now = new Date();

    // If status is explicitly 'expired'
    if (currentLicense.status === 'expired') {
      return 'expired';
    }

    // If expiresAt has passed
    if (currentLicense.expiresAt && new Date(currentLicense.expiresAt) < now) {
      return 'expired';
    }

    // License is active
    if (currentLicense.status === 'active') {
      return 'active';
    }

    return 'none';
  } catch (error) {
    console.error('[getLicenseStatusFromDb] Error:', error);
    return 'none';
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
              licenseStatus: await getLicenseStatusFromDb(user.id),
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

        // Get license status for session
        token.licenseStatus = await getLicenseStatusFromDb(user.id!);
      }
      if (trigger === 'update') {
        token.tier = await getTierFromDb(token.id as string);
        token.licenseStatus = await getLicenseStatusFromDb(token.id as string);
        return { ...token, ...session };
      }

      return token;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const cookieStore = await cookies();
        const signinModeCookie = cookieStore.get('google_signin_mode');
        const activationCookie = cookieStore.get(ACTIVATION_COOKIE);

        // === MODE 1: SIGNIN-ONLY (dari halaman /signin) ===
        // Hanya izinkan login jika user sudah terdaftar
        if (signinModeCookie?.value === 'signin_only') {
          // Hapus cookie setelah dibaca
          cookieStore.delete('google_signin_mode');

          // Cek apakah user sudah ada di database
          const existingUser = await getUserFromDb(user.email!);

          if (!existingUser) {
            // User tidak ada di database, tolak login
            // Redirect ke halaman verify-license untuk daftar
            console.log(`[Auth] Google Sign-In rejected: User ${user.email} not found in database`);
            // Return redirect URL instead of throwing error
            return '/?error=Account not found. Please register first through verify-license.';
          }

          // User ada, update emailVerified jika belum
          if (!existingUser.emailVerified) {
            await db
              .update(users)
              .set({ emailVerified: new Date() })
              .where(eq(users.id, existingUser.id));
          }

          console.log(`[Auth] Google Sign-In success: User ${user.email} logged in`);
          return true;
        }

        // === MODE 2: SIGNUP (dari halaman /signup dengan signature) ===
        // Buat user baru + aktivasi license
        if (activationCookie) {
          try {
            const activationData = JSON.parse(activationCookie.value);
            const { licenseKey, email, tier, planType, orderId } = activationData;

            // VALIDASI: Email Google HARUS sama dengan email di signature
            if (user.email !== email) {
              console.error(
                `[Auth] Google Sign-Up rejected: Email mismatch. ` +
                `Google email: ${user.email}, Signature email: ${email}`
              );
              // Hapus cookie karena tidak valid
              cookieStore.delete(ACTIVATION_COOKIE);
              // Redirect ke homepage dengan error message yang jelas
              // Tidak bisa ke /signup karena proxy akan block tanpa signature
              return `/?error=Google account email does not match the license email. Please use the Google account that matches your license.`;
            }

            // Cek apakah user sudah ada (mencegah duplikasi)
            const existingUser = await getUserFromDb(user.email!);
            if (existingUser) {
              console.log(`[Auth] User ${user.email} already exists, activating license only`);
              // User sudah ada, aktifkan license saja (untuk kasus re-purchase)
              await activateLicense(
                licenseKey,
                existingUser.id,
                tier || 'pro',
                planType || 'subscribe',
                orderId || 0,
              );
              cookieStore.delete(ACTIVATION_COOKIE);
              return true;
            }

            // User baru - JANGAN aktifkan license di sini!
            // DrizzleAdapter akan membuat user setelah signIn return true
            // License akan diaktifkan di events.createUser callback
            // Cookie ACTIVATION_COOKIE akan tetap ada dan dibaca di events.createUser
            // JANGAN hapus cookie di sini - biarkan events.createUser yang hapus setelah selesai
            console.log(`[Auth] New user signup via Google: ${user.email}. License will be activated after user creation.`);

          } catch (error) {
            console.error('[Auth] Google Sign-Up activation error:', error);
            // Hapus cookie hanya jika ada error
            cookieStore.delete(ACTIVATION_COOKIE);
            // Re-throw error untuk menampilkan pesan ke user
            if (error instanceof Error) {
              // Return redirect URL with error message
              return `/?error=${encodeURIComponent(error.message)}`;
            }
            return '/?error=Failed to activate license. Please contact support.';
          }
          // TIDAK ADA finally block - biarkan cookie tetap ada untuk events.createUser

          return true;
        }

        // === MODE 3: GOOGLE LOGIN TANPA COOKIE (fallback) ===
        // Ini terjadi jika user langsung akses Google OAuth tanpa melalui UI kita
        // Untuk keamanan, cek apakah user sudah ada
        const existingUser = await getUserFromDb(user.email!);

        if (!existingUser) {
          // Tidak ada user dan tidak ada activation cookie
          // Tolak - user harus daftar melalui flow yang benar
          console.log(`[Auth] Direct Google access rejected: User ${user.email} not found`);
          // Return redirect URL instead of throwing error
          return '/?error=Account not found. Please register first through verify-license.';
        }

        // Update emailVerified jika belum
        if (!existingUser.emailVerified) {
          await db
            .update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.id, existingUser.id));
        }

        return true;
      }

      // === CREDENTIALS LOGIN ===
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
        if (token.licenseStatus) {
          (session.user as any).licenseStatus = token.licenseStatus;
        }
      }
      return session;
    },
  },

  // Events - dipanggil SETELAH operasi database selesai
  events: {
    async createUser({ user }) {
      // Ini dipanggil SETELAH user berhasil dibuat di database
      // Sekarang aman untuk mengaktifkan license
      console.log(`[Auth Event] User created: ${user.email} (${user.id})`);

      try {
        const cookieStore = await cookies();
        const activationCookie = cookieStore.get(ACTIVATION_COOKIE);

        if (activationCookie && activationCookie.value) {
          console.log(`[Auth Event] Activation cookie found, length: ${activationCookie.value.length}`);

          // Validasi bahwa value bukan kosong dan terlihat seperti JSON
          const cookieValue = activationCookie.value.trim();
          if (!cookieValue || !cookieValue.startsWith('{')) {
            console.warn(`[Auth Event] Cookie value is not valid JSON: ${cookieValue.substring(0, 50)}...`);
            cookieStore.delete(ACTIVATION_COOKIE);
            return;
          }

          let activationData;
          try {
            activationData = JSON.parse(cookieValue);
          } catch (parseError) {
            console.error(`[Auth Event] Failed to parse cookie JSON:`, parseError);
            console.error(`[Auth Event] Cookie value was: ${cookieValue.substring(0, 100)}...`);
            cookieStore.delete(ACTIVATION_COOKIE);
            return;
          }

          const { email, licenseKey, tier, planType, orderId } = activationData;

          // Validasi data yang diperlukan
          if (!email || !licenseKey) {
            console.warn(`[Auth Event] Missing required activation data: email=${email}, licenseKey=${licenseKey}`);
            cookieStore.delete(ACTIVATION_COOKIE);
            return;
          }

          // Pastikan email cocok
          if (email === user.email) {
            console.log(`[Auth Event] Activating license for new user: ${user.email}`);

            await activateLicense(
              licenseKey,
              user.id!,
              tier || 'pro',
              planType || 'subscribe',
              orderId || 0,
            );

            console.log(`[Auth Event] License activated successfully for: ${user.email}`);
          } else {
            console.warn(`[Auth Event] Email mismatch: cookie=${email}, user=${user.email}`);
          }

          // Hapus cookie setelah diproses
          cookieStore.delete(ACTIVATION_COOKIE);
        } else {
          console.log(`[Auth Event] No activation cookie found for user: ${user.email}`);
        }
      } catch (error) {
        console.error('[Auth Event] Error activating license:', error);
        // Jangan throw error di sini - user sudah dibuat, 
        // mereka bisa mencoba aktivasi manual nanti
      }
    },
  },
});
