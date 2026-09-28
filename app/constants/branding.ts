/**
 * Белый лейбл: логотип и текст реквизитов в шапке сайта и в шапке КП (PDF).
 */

export type BrandingLogo = {
    /** data:image/png;base64,... или data:image/jpeg;base64,... */
    dataUrl: string;
};

export type Branding = {
    /** null — стандартная эмблема Калькулятора (public/logo_calc_emblem.svg, PDF/Logo.tsx). */
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

/** Горизонтальный логотип Калькулятора (эмблема + надпись) — шапка сайта. */
export const DEFAULT_LOGO_SRC = '/logo_calc_prom_poly.svg';
/** Квадратная эмблема — PDF, предпросмотр и квадратные превью. */
export const DEFAULT_LOGO_EMBLEM_SRC = '/logo_calc_emblem.svg';

/**
 * Стандартный бренд — нейтральный, самого инструмента. Его видит гость и тот,
 * кто ещё не заполнил свои реквизиты. Реквизиты ПРОФИКС здесь не живут:
 * это бренд администратора в его user.branding (миграция seed-admin-branding).
 */
export const DEFAULT_BRANDING: Branding = {
    logo: null,
    text: ['Калькулятор промышленных полов', 'calcapp.webtm.ru'].join('\n'),
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
