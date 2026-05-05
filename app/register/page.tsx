import React from 'react';
import RegisterForm from './registerForm';

const RegisterPage = () => {
    return (
        <div className='h-[calc(100vh-80px)] min-h-72 flex flex-col items-center justify-center mb-8'>
            <div className='flex flex-col items-center'>
                <h2 className='py-2.5 mb-3 text-2xl font-Exo2Bold text-primary md:text-3xl'>
                    Регистрация
                </h2>
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;
