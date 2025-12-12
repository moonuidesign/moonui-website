import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.roleUser = user.roleUser;
        token.tier = user.tier;
      }
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.roleUser = token.roleUser as 'admin' | 'user' | 'superadmin';
        session.user.tier = token.tier as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const user = auth?.user;

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCoba = nextUrl.pathname.startsWith('/coba');
      const isOnLogin = nextUrl.pathname.startsWith('/signin');

      // 1. JIKA BELUM LOGIN
      if (!isLoggedIn) {
        if (isOnDashboard || isOnAdmin || isOnCoba) {
          return false; // Otomatis redirect ke /signin
        }
        return true;
      }

      // 2. JIKA SUDAH LOGIN
      if (isLoggedIn) {
        const role = user?.roleUser ?? 'user';

        // --- Logika ADMIN ---
        if (role === 'admin' || role === 'superadmin') {
          // Jika admin ada di halaman login atau coba -> lempar ke Dashboard
          if (isOnLogin || isOnCoba) {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
          // Admin boleh akses apapun yang diawali /admin dan /dashboard
          return true;
        }

        // --- Logika USER BIASA ---
        if (role === 'user') {
          // Jika user biasa mencoba masuk halaman admin -> tolak
          if (isOnAdmin) {
            return Response.redirect(new URL('/dashboard', nextUrl)); // Atau ke 404
          }

          // Cek Status Lisensi (Tier)
          const isLicenseActive =
            user?.tier === 'pro' || user?.tier === 'pro_plus';

          if (isLicenseActive) {
            // Lisensi AKTIF
            if (isOnLogin || isOnCoba) {
              return Response.redirect(new URL('/dashboard', nextUrl));
            }
          } else {
            // Lisensi MATI / FREE
            if (isOnDashboard) {
              return Response.redirect(new URL('/coba', nextUrl));
            }
            if (isOnLogin) {
              return Response.redirect(new URL('/coba', nextUrl));
            }
          }
        }
      }

      return true;
    },
  },
  providers: [], // Diisi di auth.ts
} satisfies NextAuthConfig;
