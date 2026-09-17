/**
 * Белый лейбл: логотип и текст реквизитов в шапке сайта и в шапке КП (PDF).
 */

export type BrandingLogo = {
    /** data:image/png;base64,... или data:image/jpeg;base64,... */
    dataUrl: string;
};

export type Branding = {
    /** null — фирменный логотип ПРОФИКС (SVG из public / components/PDF/Logo.tsx). */
    logo: BrandingLogo | null;
    /** Произвольный многострочный текст. Первая строка — название компании. */
    text: string;
};

export const BRANDING_LIMITS = {
    logoBytes: 300 * 1024,
    /** Максимальная сторона логотипа после клиентского сжатия, px. */
    logoMaxSide: 600,
    /** Верхняя граница размеров, принимаемых сервером, px. */
    logoMaxSideAccepted: 2000,
    textChars: 600,
    textLines: 8,
} as const;

/** Наш телефон для шапки сайта — показывается только при фирменном бренде. */
export const DEFAULT_PHONE = {
    display: '',
    href: 'tel:+79202520001',
};

export const DEFAULT_LOGO_SRC = '/logo_calc_prom_poly.svg';

export const DEFAULT_BRANDING: Branding = {
    logo: null,
    text: [
        'ООО "ПРОФИКС НН"',
        'Телефон: +7 920 252-00-01',
        'Email: office@profix-nn.ru',
        'ИНН 5258123969 КПП 525801001 ОГРН 1155258004648',
    ].join('\n'),
};

/** Строки текста реквизитов без пустых хвостов; первая — название. */
export const brandingLines = (branding: Branding): string[] =>
    branding.text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter((line, index, all) => line !== '' || index < all.length - 1);

export const brandingTitle = (branding: Branding): string =>
    brandingLines(branding)[0] ?? '';
