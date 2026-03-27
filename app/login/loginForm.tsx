'use client';
import React from 'react';
import Form from 'next/form';
import InputText from '../components/Simple/Input/InputText';
import Button from '../components/Simple/Button/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '../server-actions/login-action';

const LoginForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [login, setLogin] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const onChangeLogin = (v: string) => {
        setLogin(v);
        if (error) setError('');
    };

    const onChangePassword = (v: string) => {
        setPassword(v);
        if (error) setError('');
    };

    const handleClickLogin = async () => {
        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);

        const result = await loginAction(formData);

        if (result.ok) {
            const nextPath = searchParams.get('next') || '/edit';
            router.push(nextPath);
            return;
        }

        setError(result.error || 'Ошибка авторизации');
        router.push('/notauth');
    };

    return (
        <Form
            action={handleClickLogin}
            className='flex flex-col mb-8 items-center'>
            <InputText
                className='w-80 mb-3'
                type={'text'}
                size={32}
                placeholder='Имя'
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
                children={'Войти'}
                backgroundSecondary={false}></Button>
        </Form>
    );
};

export default LoginForm;
