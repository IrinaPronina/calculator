'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import IconButton from './Simple/IconButton/IconButton';

type Me = { name: string; email: string };

const Header = () => {
    const router = useRouter();
    const [me, setMe] = useState<Me | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await fetch('/api/lk/me', { cache: 'no-store' });
                if (!res.ok || !active) return;
                const json: { status: string; data?: Me } = await res.json();
                if (active && json.status === 'success' && json.data) {
                    setMe(json.data);
                }
            } catch {
                // гость / ошибка — иконка ведёт на логин
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const displayName = me?.name?.trim() || me?.email || '';

    const handleIconClick = () => {
        if (me) {
            setIsOpen((prev) => !prev);
        } else {
            router.push('/login');
        }
    };

    return (
        <header className='w-full shadow-md px-4'>
            <div className='mx-auto max-w-6xl flex items-center justify-between'>
                <div className='hidden lg:block'>
                    <a href='tel:+79202520001'>+7 (920) 252-00-01</a>
                </div>
                <div className='w-auto max-w-72 m-auto lg:max-w-80 h-20'>
                    <Image
                        src='/logo_svg.svg'
                        alt='Logo'
                        className='w-full h-full'
                        width={100}
                        height={24}
                        priority
                    />
                </div>
                <div className='flex items-center'>
                    {me ? (
                        <span className='ml-3 hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:block'>
                            {displayName}
                        </span>
                    ) : null}
                    <div className='relative' ref={menuRef}>
                        <IconButton
                            className='ml-2'
                            size={32}
                            variant={'ghost'}
                            type={'button'}
                            children={
                                <Image
                                    src='/lk.svg'
                                    alt={me ? 'Личный кабинет' : 'Войти'}
                                    className='w-full h-full'
                                    width={20}
                                    height={20}
                                    priority
                                />
                            }
                            onClick={handleIconClick}
                            backgroundSecondary={false}></IconButton>
                        {me && isOpen ? (
                            <div className='absolute right-0 z-20 mt-2 w-56 rounded-md border border-slate-200 bg-white py-2 shadow-lg'>
                                <div className='px-4 py-2'>
                                    <div className='truncate text-sm font-semibold text-slate-900'>
                                        {me.name?.trim() || 'Пользователь'}
                                    </div>
                                    {me.email ? (
                                        <div className='truncate text-xs text-slate-500'>
                                            {me.email}
                                        </div>
                                    ) : null}
                                </div>
                                <div className='my-1 border-t border-slate-100' />
                                <Link
                                    href='/lk'
                                    onClick={() => setIsOpen(false)}
                                    className='block px-4 py-2 text-sm text-[#54b0bf] hover:bg-slate-50'>
                                    Перейти в ЛК
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
