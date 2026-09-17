import type { SafeUser } from '@/app/utils/user';
import { DEFAULT_BRANDING, type Branding } from '@/app/constants/branding';

/** Бренд считается заполненным, если есть логотип или непустой текст. */
export const isBrandingFilled = (
    branding: Branding | null | undefined,
): branding is Branding =>
    Boolean(branding) &&
    (Boolean(branding!.logo?.dataUrl) || branding!.text.trim() !== '');

/**
 * Чей бренд показывать в шапке сайта и в PDF.
 *
 * - нет сессии               → фирменный
 * - role === 'admin'         → фирменный, что бы ни было сохранено
 * - бренд не заполнен        → фирменный
 * - бренд заполнен           → пользовательский целиком, без подмешивания наших полей
 */
export const resolveBranding = (user: SafeUser | null | undefined): Branding => {
    if (!user || user.role === 'admin') {
        return DEFAULT_BRANDING;
    }
    if (!isBrandingFilled(user.branding)) {
        return DEFAULT_BRANDING;
    }
    return {
        logo: user.branding.logo?.dataUrl ? { dataUrl: user.branding.logo.dataUrl } : null,
        text: user.branding.text,
    };
};

export const isDefaultBranding = (branding: Branding): boolean =>
    branding === DEFAULT_BRANDING;
