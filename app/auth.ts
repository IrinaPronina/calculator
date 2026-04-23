import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import YandexProvider from 'next-auth/providers/yandex';
import VKProvider from 'next-auth/providers/vk';

type DbUser = {
    _id: { toString(): string };
    username?: string;
    email?: string;
    password?: string;
    passwordHash?: string;
    role?: string;
    name?: string;
    isActive?: boolean;
};

const getUsersCollection = async () => {
    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    return client.db(process.env.DB_NAME).collection<DbUser>('user');
};

const findUserByLogin = async (login: string): Promise<DbUser | null> => {
    const users = await getUsersCollection();
    const normalizedLogin = login.trim().toLowerCase();

    return users.findOne({
        $or: [{ username: login.trim() }, { email: normalizedLogin }],
    });
};

const verifyUserPassword = async (
    user: DbUser,
    password: string,
): Promise<boolean> => {
    if (user.passwordHash) {
        const bcrypt = await import('bcrypt');
        return bcrypt.default.compare(password, user.passwordHash);
    }

    if (typeof user.password === 'string') {
        return user.password === password;
    }

    return false;
};

const mapUserRole = (user: DbUser): string => {
    if (user.role) {
        return user.role;
    }

    if (user.username === 'administrator') {
        return 'admin';
    }

    return 'user';
};

const providers: NextAuthConfig['providers'] = [
    Credentials({
        name: 'Credentials',
        credentials: {
            login: { label: 'Логин', type: 'text', placeholder: 'Логин' },
            password: {
                label: 'Пароль',
                type: 'password',
                placeholder: 'Пароль',
            },
        },
        async authorize(credentials) {
            if (!credentials) {
                return null;
            }

            const login = String(credentials.login || '').trim();
            const password = String(credentials.password || '');
            if (!login || !password) {
                return null;
            }

            try {
                const user = await findUserByLogin(login);
                if (!user || user.isActive === false) {
                    return null;
                }

                const isPasswordValid = await verifyUserPassword(
                    user,
                    password,
                );
                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    name: user.name || user.username || user.email || 'User',
                    email: user.email || `${user.username || 'user'}@local`,
                    role: mapUserRole(user),
                };
            } catch (error) {
                console.error('Credentials authorize failed:', error);
                return null;
            }
        },
    }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    );
}

if (process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET) {
    providers.push(
        YandexProvider({
            clientId: process.env.YANDEX_CLIENT_ID,
            clientSecret: process.env.YANDEX_CLIENT_SECRET,
        }),
    );
}

if (process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET) {
    providers.push(
        VKProvider({
            clientId: process.env.VK_CLIENT_ID,
            clientSecret: process.env.VK_CLIENT_SECRET,
        }),
    );
}

export const authConfig: NextAuthConfig = {
    secret:
        process.env.AUTH_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        'dev-only-change-me-nextauth-secret',
    trustHost: true,
    session: { strategy: 'jwt' as const },
    pages: {
        signIn: '/login',
    },
    providers,
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role || 'user';
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = String(token.id || '');
                session.user.role = String(token.role || 'user');
                session.user.name = session.user.name || token.name || '';
                session.user.email = session.user.email || token.email || '';
            }
            return session;
        },
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
