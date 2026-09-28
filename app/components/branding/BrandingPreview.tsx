'use client';

import React from 'react';
import {
    DEFAULT_LOGO_EMBLEM_SRC,
    brandingLines,
    type Branding,
} from '@/app/constants/branding';
import { effectiveBranding, isBrandingFilled } from '@/app/utils/branding';

type BrandingPreviewProps = {
    draft: Branding;
};

/** Порог, после которого PdfCompanyHeader уменьшает кегль названия. */
const LONG_NAME_CHARS = 40;

/**
 * HTML-повтор шапки КП из components/PDF/PdfCompanyHeader.tsx:
 * те же пропорции, цвета и правило «первая строка — название».
 * Показывает то, что реально попадёт в PDF — через тот же effectiveBranding,
 * что и сервер: пустой черновик → стандартный бренд, логотип без текста →
 * логотип свой + стандартный текст.
 */
export default function BrandingPreview({ draft }: BrandingPreviewProps) {
    const isOwn = isBrandingFilled(draft);
    const shown = effectiveBranding(draft);
    const usesDefaultText = isOwn && draft.text.trim() === '';
    const [name = '', ...rest] = brandingLines(shown);

    return (
        <div>
            <div className='mb-2 flex items-baseline justify-between gap-4'>
                <span className='text-xs uppercase tracking-wide text-slate-500'>
                    Так будет выглядеть шапка КП
                </span>
                <span className='text-xs text-slate-400'>
                    {!isOwn
                        ? 'стандартная шапка Калькулятора'
                        : usesDefaultText
                          ? 'ваш логотип, текст стандартный'
                          : 'ваши реквизиты'}
                </span>
            </div>

            <div
                className='flex border border-[#d1d5db] bg-[#fbf9fa] text-[#475569]'
                aria-hidden='true'>
                <div className='flex w-[60%] items-center gap-3 border-r border-[#d1d5db] p-3'>
                    <img
                        src={shown.logo ? shown.logo.dataUrl : DEFAULT_LOGO_EMBLEM_SRC}
                        alt=''
                        className='h-16 w-16 shrink-0 object-contain'
                    />
                    <div className='min-w-0 flex-1'>
                        {name ? (
                            <div
                                className={`mb-1 break-words font-bold leading-tight ${
                                    name.length > LONG_NAME_CHARS
                                        ? 'text-[11px]'
                                        : 'text-sm'
                                }`}>
                                {name}
                            </div>
                        ) : null}
                        {rest.map((line, index) => (
                            <div
                                key={index}
                                className='break-words text-[10px] leading-snug text-[#4a5565]'>
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex w-[40%] flex-col justify-center p-3'>
                    <div className='text-[10px] font-semibold uppercase tracking-wide'>
                        Расчет
                    </div>
                    <div className='text-sm font-bold'>№ —</div>
                    <div className='text-[10px] text-[#4a5565]'>Дата: —</div>
                </div>
            </div>
        </div>
    );
}
