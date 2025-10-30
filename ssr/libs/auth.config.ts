import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        // Jika user belum login, redirect ke signin
        if (!isLoggedIn) {
          return Response.redirect(new URL('/signin', nextUrl));
        }
        // Jika sudah login, izinkan akses (role checking dilakukan di middleware)
        return true;
      } else if (isLoggedIn) {
        // Jika sudah login dan tidak di dashboard, redirect ke dashboard user
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
