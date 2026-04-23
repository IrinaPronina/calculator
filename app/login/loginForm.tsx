'use client';

import React from 'react';
import InputText from '../components/Simple/Input/InputText';
import Button from '../components/Simple/Button/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [login, setLogin] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onChangeLogin = (v: string) => {
        setLogin(v);
        if (error) setError('');
    };

    const onChangePassword = (v: string) => {
        setPassword(v);
        if (error) setError('');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        const result = await signIn('credentials', {
            login,
            password,
            redirect: false,
        });

        setIsSubmitting(false);

        if (!result || result.error) {
            setError('Неверный логин или пароль');
            return;
        }

        const nextPath = searchParams.get('next') || '/edit';
        router.push(nextPath);
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col mb-8 items-center'>
            <InputText
                className='w-80 mb-3'
                type={'text'}
                size={32}
                placeholder='Логин'
                value={login}
                onChange={onChangeLogin}
            />
            <InputText
                className='w-80 mb-3'
                type={'password'}
                size={32}
                placeholder='Пароль'
                value={password}
                onChange={onChangePassword}
            />
            {error ? (
                <div className='w-80 mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                    {error}
                </div>
            ) : null}
            <Button
                className='w-80'
                size={52}
                variant={'primary'}
                type={'submit'}
                children={isSubmitting ? 'Входим...' : 'Войти'}
                backgroundSecondary={false}></Button>
            <Button
                className='w-80 mt-2'
                size={52}
                variant={'secondary'}
                type={'button'}
                onClick={() => signIn('yandex', { callbackUrl: '/edit' })}
                children={'Войти через Яндекс'}
                backgroundSecondary={false}></Button>
        </form>
    );
};

export default LoginForm;
