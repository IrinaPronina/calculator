import NextAuth from 'next-auth';
import { ZodError } from 'zod';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from './lib/auth-schemas';

import bcryptjs from 'bcryptjs';

// import GoogleProvider from 'next-auth/providers/google';
// import YandexProvider from 'next-auth/providers/yandex';
// import VKProvider from 'next-auth/providers/vk';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'Email' },
                password: {
                    label: 'Пароль',
                    type: 'password',
                    placeholder: 'Пароль',
                },
            },
            authorize: async (credentials) => {
                try {
                    if (!credentials.email || !credentials.password) {
                        return null;
                    }

                    const { email, password } =
                        await loginSchema.parseAsync(credentials);

                    const { getUserFromDb } = await import('./utils/user');
                    const user = await getUserFromDb(email);

                    if (!user || !user.password) {
                        throw new Error('Invalid credentials.');
                    }
                    const isPasswordValid = await bcryptjs.compare(
                        password,
                        user.password,
                    );
                    if (!isPasswordValid) {
                        throw new Error('Invalid credentials.');
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name || user.name || user.email || 'User',
                        email: user.email || email,
                        role:
                            user.role ||
                            (user.name === 'administrator' ? 'admin' : 'user'),
                    };
                } catch (error) {
                    if (error instanceof ZodError) {
                        // Return `null` to indicate that the credentials are invalid
                        return null;
                    }
                    return null;
                }
            },
        }),
    ],
});
