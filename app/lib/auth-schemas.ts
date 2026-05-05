import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Некорректный email'),
    password: z
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .max(200, 'Пароль слишком длинный'),
});
export type LoginSchemaInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(100, 'Имя слишком длинное'),
    email: z.email('Некорректный email'),
    password: z
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .max(200, 'Пароль слишком длинный'),
    confirmPassword: z
        .string()
        .min(1, 'Подтвердите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
});

export type RegisterSchemaInput = z.infer<typeof registerSchema>;
