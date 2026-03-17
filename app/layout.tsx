import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import localfont from 'next/font/local';
import './globals.css';
import Header from '@/app/components/header';
import { headers } from 'next/headers';

const exo2 = localfont({
    src: './fonts/Exo2Light.woff',
    variable: '--font-exo2',
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Калькулятор бетонных полов',
    description: 'Посчитать стоимость устройства бетонных полов',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();
    const isPDFRoute = headersList.get('x-pdf-route') === 'true';

    return (
        <html
            lang='ru'
            suppressHydrationWarning
            className={
                !isPDFRoute
                    ? `${exo2.variable} ${geistMono.variable}`
                    : `${exo2.variable} ${geistMono.variable} h-full`
            }>
            <body suppressHydrationWarning className='h-full'>
                {!isPDFRoute && <Header />}
                <main
                    className={`min-h-full  ${
                        isPDFRoute ? 'h-full' : 'max-w-6xl m-auto p-4'
                    }`}>
                    {children}
                </main>
            </body>
        </html>
    );
}
