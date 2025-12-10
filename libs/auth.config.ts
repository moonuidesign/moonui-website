import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const user = auth?.user;

      // Definisikan path
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnCoba = nextUrl.pathname.startsWith('/coba');
      const isOnLogin = nextUrl.pathname.startsWith('/signin');

      // 1. JIKA BELUM LOGIN
      if (!isLoggedIn) {
        // Jika mencoba masuk halaman yang butuh akses, lempar ke login
        if (isOnDashboard || isOnAdmin || isOnCoba) {
          return Response.redirect(new URL('/signin', nextUrl));
        }
        return true;
      }

      // 2. JIKA SUDAH LOGIN (Logic Role & Tier)
      if (isLoggedIn) {
        // A. Cek Superadmin / Admin
        if (user?.roleUser === 'admin' || user?.roleUser === 'superadmin') {
          // Jika admin nyasar ke halaman login atau coba, balikin ke dashboard admin
          if (isOnLogin || isOnCoba) {
            return Response.redirect(new URL('/admin/dashboard', nextUrl));
          }
          // Izinkan akses ke mana saja (atau batasi akses user biasa jika perlu)
          return true;
        }

        // B. Cek Regular User
        if (user?.roleUser === 'user') {
          // Cek Tier Lisensi
          // Asumsi: 'free' berarti expired/tidak aktif, 'pro'/'pro_plus' berarti aktif
          const isLicenseActive =
            user?.tier === 'pro' || user?.tier === 'pro_plus';

          if (!isLicenseActive) {
            // JIKA LISENSI MATI / FREE
            // Jangan biarkan masuk dashboard, paksa ke /coba
            if (isOnDashboard) {
              return Response.redirect(new URL('/coba', nextUrl));
            }
            // Izinkan akses ke /coba
            if (isOnCoba) {
              return true;
            }
          } else {
            // JIKA LISENSI AKTIF
            // Jangan biarkan masuk /coba (opsional, tergantung flow)
            if (isOnCoba) {
              return Response.redirect(new URL('/dashboard', nextUrl));
            }
            // Izinkan masuk dashboard
            return true;
          }

          // Redirect user dari login page ke tujuan yang benar
          if (isOnLogin) {
            return Response.redirect(
              new URL(isLicenseActive ? '/dashboard' : '/coba', nextUrl),
            );
          }
        }
      }

      return true;
    },
  },
  providers: [], // Providers didefinisikan di auth.ts
} satisfies NextAuthConfig;
