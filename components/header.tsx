import Image from 'next/image';

const Header = ()=>{
return (
    <header className="w-full">
      <div className="container mx-auto p-4 max-w-1200 flex items-center justify-between">
        <div>
          <a href="tel:+79202520001">
            +7 (920) 252-00-01
          </a>
        </div>
        <div className='w-auto max-w-500 h-20'>
          <Image
            src="/logo_svg.svg"
            alt="Logo"
            className='w-full h-full'
            width={100}
            height={24}
            priority
          />
        </div>
        <div className="_email">
          <a href="mailto:prompol@profix-nn.ru" className='block'>
            prompol@profix-nn.ru
          </a>
        </div>
      </div>
      <hr />
    </header>

)
}

export default Header;