'use client';
import React from 'react';
import Form from 'next/form';
import InputText from '../components/Simple/Input/InputText';
import Button from '../components/Simple/Button/Button';
import { useRouter } from 'next/navigation';
import { loginAction } from '../server-actions/login-action';

const LoginForm = () => {
    const router = useRouter();
    const [login, setLogin] = React.useState('');
    const [password, setPassword] = React.useState('');
    const onChangeLogin = (v: string) => {
        setLogin(v);
    };
    const onChangePassword = (v: string) => {
        setPassword(v);
    };
    const handleClickLogin = async () => {
        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        if (login === 'administrator' && password === 'dimvs2003') {
            await loginAction(formData);
            router.push('/edit');
        } else {
            router.push('/notauth');
        }
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
                type={'text'}
                size={32}
                placeholder='Пароль'
                value={password}
                onChange={onChangePassword}
            />
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
