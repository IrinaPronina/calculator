import React from 'react';
import LoginForm from './loginForm';
import { Suspense } from 'react';

const PageLogin = () => {
    return (
        <div className='h-[calc(100vh-80px)] min-h-72 flex flex-col items-center justify-center mb-8'>
            <div className='flex flex-col items-center'>
                <h2 className='py-2.5 mb-3 text-2xl font-Exo2Bold text-primary md:text-3xl'>
                    Войдите в систему
                </h2>
                <Suspense fallback={<div className='text-sm text-slate-500'>Загрузка...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
};

export default PageLogin;
