import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string;
    }
}

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        id: string;
        name: string;
        email: string;
        role?: string;
    }
}
