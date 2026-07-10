'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import InputText from '../components/Simple/Input/InputText';
import Button from '../components/Simple/Button/Button';
import { registerSchema } from '@/app/lib/auth-schemas';

const RegisterForm = () => {
    const router = useRouter();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
        React.useState(false);
    const [error, setError] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const clearError = () => {
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        const parsed = registerSchema.safeParse({
            name,
            email,
            password,
            confirmPassword,
        });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message || 'Проверьте данные');
            return;
        }

        setIsSubmitting(true);
        setError('');

        // autoSignIn включён по умолчанию: после регистрации сессия уже есть.
        const { error: signUpError } = await authClient.signUp.email({
            name: parsed.data.name,
            email: parsed.data.email,
            password: parsed.data.password,
        });

        setIsSubmitting(false);
        if (signUpError) {
            if (signUpError.status === 422) {
                setError('Пользователь с таким email уже существует');
            } else if (signUpError.status === 429) {
                setError('Слишком много попыток. Попробуйте через минуту');
            } else {
                setError('Ошибка регистрации');
            }
            return;
        }

        router.push('/lk');
        router.refresh();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='flex flex-col mb-8 items-center'>
            <InputText
                className='w-80 mb-3'
                type='text'
                size={32}
                placeholder='Имя'
                value={name}
                onChange={(v) => {
                    setName(v);
                    clearError();
                }}
            />
            <InputText
                className='w-80 mb-3'
                type='text'
                size={32}
                placeholder='Email'
                value={email}
                onChange={(v) => {
                    setEmail(v);
                    clearError();
                }}
            />
            <div className='relative w-80 mb-3'>
                <InputText
                    className='w-full pr-10'
                    type={isPasswordVisible ? 'text' : 'password'}
                    size={32}
                    placeholder='Пароль'
                    value={password}
                    onChange={(v) => {
                        setPassword(v);
                        clearError();
                    }}
                />
                <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700'
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                    aria-label={
                        isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
                    }>
                    {isPasswordVisible ? (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            className='h-5 w-5'
                            aria-hidden='true'>
                            <path d='M3 3l18 18' />
                            <path d='M10.6 10.6a2 2 0 102.8 2.8' />
                            <path d='M9.9 5.2A10.7 10.7 0 0112 5c5.5 0 9.3 4.4 10 7-.2.8-.7 1.7-1.4 2.6' />
                            <path d='M6.6 6.7C4.6 8.1 3.3 10 3 12c.7 2.6 4.5 7 10 7a10 10 0 004-.8' />
                        </svg>
                    ) : (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            className='h-5 w-5'
                            aria-hidden='true'>
                            <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z' />
                            <circle cx='12' cy='12' r='3' />
                        </svg>
                    )}
                </button>
            </div>
            <div className='relative w-80 mb-3'>
                <InputText
                    className='w-full pr-10'
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    size={32}
                    placeholder='Повторите пароль'
                    value={confirmPassword}
                    onChange={(v) => {
                        setConfirmPassword(v);
                        clearError();
                    }}
                />
                <button
                    type='button'
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700'
                    onClick={() =>
                        setIsConfirmPasswordVisible((prev) => !prev)
                    }
                    aria-label={
                        isConfirmPasswordVisible
                            ? 'Скрыть подтверждение пароля'
                            : 'Показать подтверждение пароля'
                    }>
                    {isConfirmPasswordVisible ? (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            className='h-5 w-5'
                            aria-hidden='true'>
                            <path d='M3 3l18 18' />
                            <path d='M10.6 10.6a2 2 0 102.8 2.8' />
                            <path d='M9.9 5.2A10.7 10.7 0 0112 5c5.5 0 9.3 4.4 10 7-.2.8-.7 1.7-1.4 2.6' />
                            <path d='M6.6 6.7C4.6 8.1 3.3 10 3 12c.7 2.6 4.5 7 10 7a10 10 0 004-.8' />
                        </svg>
                    ) : (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            className='h-5 w-5'
                            aria-hidden='true'>
                            <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z' />
                            <circle cx='12' cy='12' r='3' />
                        </svg>
                    )}
                </button>
            </div>
            {error ? (
                <div className='w-80 mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                    {error}
                </div>
            ) : null}
            <Button
                className='w-80'
                size={52}
                variant='primary'
                type='submit'
                children={
                    isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'
                }
                backgroundSecondary={false}
            />
            <Button
                className='w-80 mt-2'
                size={52}
                variant='secondary'
                type='button'
                onClick={() => router.push('/login')}
                children='Уже есть аккаунт'
                backgroundSecondary={false}
            />
        </form>
    );
};

export default RegisterForm;
