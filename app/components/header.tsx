'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import IconButton from './Simple/IconButton/IconButton';

const Header = () => {
    const router = useRouter();
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
                    <div className=' hidden lg:block'>
                        <a href='mailto:prompol@profix-nn.ru' className='block'>
                            prompol@profix-nn.ru
                        </a>
                    </div>
                    <IconButton
                        className='ml-2'
                        size={32}
                        variant={'ghost'}
                        type={'button'}
                        children={
                            <Image
                                src='/lk.svg'
                                alt='Login'
                                className='w-full h-full'
                                width={20}
                                height={20}
                                priority
                            />
                        }
                        onClick={() => {
                            router.push('/login');
                        }}
                        backgroundSecondary={false}></IconButton>
                </div>
            </div>
        </header>
    );
};

export default Header;
