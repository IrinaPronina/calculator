'use client';

import Link from 'next/link';
import React from 'react';
import InputText from '@/app/components/Simple/Input/InputText';
import Button from '@/app/components/Simple/Button/Button';
import { signOut } from 'next-auth/react';

type LkClientProps = {
    initialName: string;
    initialEmail: string;
};

export default function LkClient({ initialName, initialEmail }: LkClientProps) {
    const [name, setName] = React.useState(initialName);
    const [email] = React.useState(initialEmail);
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [isPasswordSectionVisible, setIsPasswordSectionVisible] =
        React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isSigningOut, setIsSigningOut] = React.useState(false);

    const handleSignOut = async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <div className='mx-auto max-w-lg py-10'>
            <div className='mb-6 flex items-start justify-between gap-3'>
                <div>
                    <h1 className='mb-1 text-2xl font-Exo2Bold text-slate-900'>
                        Личный кабинет
                    </h1>
                    <p className='text-sm text-slate-500'>
                        Можете изменить имя или пароль
                    </p>
                </div>
                <Button
                    className='min-w-fit'
                    size={32}
                    variant='ghost'
                    type='button'
                    onClick={handleSignOut}
                    children={isSigningOut ? 'Выходим...' : 'ВЫЙТИ'}
                    backgroundSecondary={false}
                />
            </div>

            <div className='mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <Link
                    href='/'
                    className='rounded-md border-2 border-[#54b0bf] bg-[#54b0bf] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[#54b0bf]'>
                    Перейти в калькулятор
                </Link>
                <Link
                    href='/edit'
                    className='rounded-md border-2 border-slate-700 bg-slate-700 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-slate-700'>
                    Перейти к редактированию
                </Link>
            </div>

            <div className='rounded-lg border border-slate-200 bg-white p-5'>
                <h2 className='mb-4 text-base font-semibold text-slate-900'>
                    Данные профиля
                </h2>

                <div className='mb-4'>
                    <label className='mb-2 block text-xs uppercase tracking-wide text-slate-500'>
                        Имя
                    </label>
                    <InputText
                        className='w-full rounded-md border border-slate-200'
                        type='text'
                        size={32}
                        placeholder='Введите имя'
                        value={name}
                        onChange={setName}
                    />
                </div>

                <div className='mb-4'>
                    <label className='mb-2 block text-xs uppercase tracking-wide text-slate-500'>
                        Email
                    </label>
                    <InputText
                        className='w-full rounded-md border border-slate-200 bg-slate-50 text-slate-500'
                        type='text'
                        size={32}
                        placeholder='Email'
                        value={email}
                        onChange={() => {}}
                        disabled
                    />
                </div>

                <div className='mb-6'>
                    <button
                        type='button'
                        className='rounded-md border border-slate-200 px-3 py-2 text-xs uppercase tracking-wide text-slate-600 transition hover:bg-slate-50'
                        onClick={() =>
                            setIsPasswordSectionVisible((prev) => !prev)
                        }>
                        Изменить пароль
                    </button>
                </div>

                {isPasswordSectionVisible ? (
                    <>
                        <div className='mb-4'>
                            <label className='mb-2 block text-xs uppercase tracking-wide text-slate-500'>
                                Новый пароль
                            </label>
                            <div className='relative'>
                                <InputText
                                    className='w-full rounded-md border border-slate-200 pr-16'
                                    type={showPassword ? 'text' : 'password'}
                                    size={32}
                                    placeholder='Введите новый пароль'
                                    value={password}
                                    onChange={setPassword}
                                />
                                <button
                                    type='button'
                                    className='absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showPassword
                                            ? 'Скрыть пароль'
                                            : 'Показать пароль'
                                    }>
                                    {showPassword ? 'Скрыть' : 'Показать'}
                                </button>
                            </div>
                        </div>

                        <div className='mb-6'>
                            <label className='mb-2 block text-xs uppercase tracking-wide text-slate-500'>
                                Повторите пароль
                            </label>
                            <div className='relative'>
                                <InputText
                                    className='w-full rounded-md border border-slate-200 pr-16'
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    size={32}
                                    placeholder='Повторите новый пароль'
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                />
                                <button
                                    type='button'
                                    className='absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    onClick={() =>
                                        setShowConfirmPassword((prev) => !prev)
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Скрыть подтверждение пароля'
                                            : 'Показать подтверждение пароля'
                                    }>
                                    {showConfirmPassword
                                        ? 'Скрыть'
                                        : 'Показать'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : null}

                <Button
                    className='w-full'
                    size={52}
                    variant='primary'
                    type='button'
                    children='Сохранить изменения'
                    backgroundSecondary={false}
                />
            </div>
        </div>
    );
}
