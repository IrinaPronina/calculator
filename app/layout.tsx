import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import localfont from 'next/font/local';
import './globals.css';
import Header from '@/app/components/header';
import { headers } from 'next/headers';
import { getCurrentUser } from '@/app/utils/settings';
import { resolveBranding } from '@/app/utils/branding';
import { DEFAULT_BRANDING, type Branding } from '@/app/constants/branding';

/**
 * Бренд для шапки сайта берём на сервере, чтобы у подрядчика не мигал
 * стандартный логотип перед своим. База недоступна или сессии нет —
 * стандартный бренд Калькулятора.
 */
async function loadHeaderBranding(): Promise<Branding> {
    try {
        return resolveBranding(await getCurrentUser());
    } catch (error) {
        console.error('Error loading header branding:', error);
        return DEFAULT_BRANDING;
    }
}

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
    const branding = isPDFRoute ? DEFAULT_BRANDING : await loadHeaderBranding();

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
                {!isPDFRoute && <Header branding={branding} />}
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
