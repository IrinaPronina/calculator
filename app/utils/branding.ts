import type { SafeUser } from '@/app/utils/user';
import { DEFAULT_BRANDING, type Branding } from '@/app/constants/branding';

/** Бренд считается заполненным, если есть логотип или непустой текст. */
export const isBrandingFilled = (
    branding: Branding | null | undefined,
): branding is Branding =>
    Boolean(branding) &&
    (Boolean(branding!.logo?.dataUrl) || branding!.text.trim() !== '');

/**
 * Что реально попадёт в шапку сайта и PDF для данного (черновика) бренда:
 * - пусто                 → стандартный бренд Калькулятора целиком;
 * - есть логотип, текст пуст → логотип свой, текст — стандартный
 *   («Калькулятор промышленных полов» первой строкой);
 * - есть текст            → всё своё.
 * Одна функция для сервера (resolveBranding) и предпросмотра в /edit,
 * чтобы человек видел до сохранения ровно то, что окажется в PDF.
 */
export const effectiveBranding = (
    branding: Branding | null | undefined,
): Branding => {
    if (!isBrandingFilled(branding)) {
        return DEFAULT_BRANDING;
    }
    return {
        logo: branding.logo?.dataUrl ? { dataUrl: branding.logo.dataUrl } : null,
        text: branding.text.trim() !== '' ? branding.text : DEFAULT_BRANDING.text,
    };
};

/** Чей бренд показывать пользователю. Одно правило для всех ролей, см. effectiveBranding. */
export const resolveBranding = (user: SafeUser | null | undefined): Branding =>
    effectiveBranding(user?.branding);

export const isDefaultBranding = (branding: Branding): boolean =>
    branding === DEFAULT_BRANDING;
