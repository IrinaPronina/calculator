import { BRANDING_LIMITS } from '@/app/constants/branding';

/**
 * Подготовка логотипа на клиенте перед отправкой в /api/lk/branding.
 *
 * 1. Исходник больше MAX_SOURCE_BYTES — отказ до всякой обработки, чтобы не
 *    подвесить вкладку декодированием 40-мегабайтной фотографии.
 * 2. Масштаб до BRANDING_LIMITS.logoMaxSide по большей стороне, PNG.
 *    SVG проходит тем же путём и становится растром — react-pdf SVG из
 *    data-URL не умеет.
 * 3. PNG больше BRANDING_LIMITS.logoBytes (фотографии, градиенты):
 *    - без прозрачности → JPEG 0.85, затем 0.7;
 *    - с прозрачностью → PNG на меньшей стороне (400, затем 300 px), чтобы не
 *      получить чёрный фон вместо прозрачного.
 * 4. Не влезло — понятная ошибка, сервер всё равно проверит границу сам.
 *
 * Только браузер: использует Image и canvas.
 */

export class LogoCompressError extends Error {}

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const JPEG_QUALITIES = [0.85, 0.7];
const FALLBACK_SIDES = [400, 300];

const loadImage = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new LogoCompressError('Не удалось прочитать изображение.'));
        };
        img.src = url;
    });

/** Размер исходника; у SVG без width/height браузер отдаёт 0 — подставляем квадрат. */
const sourceSize = (img: HTMLImageElement) => ({
    width: img.naturalWidth || BRANDING_LIMITS.logoMaxSide,
    height: img.naturalHeight || BRANDING_LIMITS.logoMaxSide,
});

const fitTo = (width: number, height: number, maxSide: number) => {
    const scale = Math.min(1, maxSide / Math.max(width, height));
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
};

/** Байты картинки внутри data-URL: base64 ≈ 4/3 от исходника. */
const dataUrlBytes = (dataUrl: string) => {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    return Math.floor((base64.length * 3) / 4) - padding;
};

const draw = (img: HTMLImageElement, maxSide: number): HTMLCanvasElement => {
    const source = sourceSize(img);
    const target = fitTo(source.width, source.height, maxSide);
    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new LogoCompressError(
            'Браузер не поддерживает обработку изображений.',
        );
    }
    ctx.drawImage(img, 0, 0, target.width, target.height);
    return canvas;
};

/** Есть ли хоть один не полностью непрозрачный пиксель. Проверяем по сетке — быстро и достаточно. */
const hasTransparency = (canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const { width, height } = canvas;
    const step = Math.max(1, Math.floor(Math.max(width, height) / 64));
    for (let y = 0; y < height; y += step) {
        const row = ctx.getImageData(0, y, width, 1).data;
        for (let x = 3; x < row.length; x += 4 * step) {
            if (row[x] < 255) return true;
        }
    }
    return false;
};

export const compressLogo = async (file: File): Promise<string> => {
    if (file.size > MAX_SOURCE_BYTES) {
        throw new LogoCompressError(
            `Файл больше ${MAX_SOURCE_BYTES / 1024 / 1024} МБ — выберите картинку поменьше.`,
        );
    }

    const img = await loadImage(file);
    const limit = BRANDING_LIMITS.logoBytes;

    // Основной проход: PNG на максимальной стороне.
    const canvas = draw(img, BRANDING_LIMITS.logoMaxSide);
    const png = canvas.toDataURL('image/png');
    if (dataUrlBytes(png) <= limit) {
        return png;
    }

    if (!hasTransparency(canvas)) {
        // Непрозрачная картинка (фотография, растровый логотип на белом) — JPEG.
        for (const quality of JPEG_QUALITIES) {
            const jpeg = canvas.toDataURL('image/jpeg', quality);
            if (dataUrlBytes(jpeg) <= limit) {
                return jpeg;
            }
        }
    }

    // Прозрачность есть (или JPEG не помог) — уменьшаем PNG.
    for (const side of FALLBACK_SIDES) {
        const smaller = draw(img, side).toDataURL('image/png');
        if (dataUrlBytes(smaller) <= limit) {
            return smaller;
        }
    }

    throw new LogoCompressError(
        `Не удалось уменьшить логотип до ${Math.round(limit / 1024)} КБ — попробуйте более простую картинку.`,
    );
};
