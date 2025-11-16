import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import { AdapterUser as DefaultAdapterUser } from 'next-auth/adapters';

declare module 'next-auth' {
  interface User extends DefaultUser {
    emailVerified: Date | null;

    roleUser?: 'admin' | 'user';
  }

  interface AdapterUser extends DefaultAdapterUser {
    roleUser?: 'admin' | 'user';
  }

  interface Session {
    user: {
      id: string;
      emailVerified: Date | null;

      roleUser: 'admin' | 'user';
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    emailVerified: Date | null;

    roleUser: 'admin' | 'user';
  }
}
