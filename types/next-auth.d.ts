import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
    managedBy?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'USER';
      managedBy?: string | null;
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'ADMIN' | 'USER';
    managedBy?: string | null;
  }
}