import Image from 'next/image';

const Header = () => {
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
                <div className='hidden lg:block'>
                    <a href='mailto:prompol@profix-nn.ru' className='block'>
                        prompol@profix-nn.ru
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Header;
