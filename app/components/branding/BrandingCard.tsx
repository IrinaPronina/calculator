'use client';

import React from 'react';
import Button from '../Simple/Button/Button';
import BrandingPreview from './BrandingPreview';
import { compressLogo, LogoCompressError } from '@/app/utils/image-client';
import {
    BRANDING_LIMITS,
    DEFAULT_LOGO_EMBLEM_SRC,
    type Branding,
} from '@/app/constants/branding';

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml']);

export type BrandingSaveStatus = {
    type: 'success' | 'error';
    text: string;
} | null;

type BrandingCardProps = {
    /** Черновик бренда — состояние живёт в ConcreteType, как и draftSettings. */
    draft: Branding;
    onChange: (patch: Partial<Branding>) => void;
    onSave: () => void;
    /** Есть изменения, текст в лимитах, не идёт сохранение. */
    canSave: boolean;
    onReset: () => void;
    /** В базе есть сохранённый бренд — есть что сбрасывать. */
    canReset: boolean;
    isSaving: boolean;
    status: BrandingSaveStatus;
};

const TEXT_PLACEHOLDER = [
    'ООО "Ваша компания"',
    'Телефон: +7 ...',
    'Email: ...',
    'ИНН ... КПП ... ОГРН ...',
].join('\n');

/** Клиентская сторона лимитов из BRANDING_LIMITS — сервер проверяет те же цифры. */
export const measureBrandingText = (text: string) => {
    const normalized = text.replace(/\r\n?/g, '\n').trim();
    const chars = normalized.length;
    const lines = normalized === '' ? 0 : normalized.split('\n').length;
    return {
        chars,
        lines,
        isValid:
            chars <= BRANDING_LIMITS.textChars &&
            lines <= BRANDING_LIMITS.textLines,
    };
};

/**
 * Вкладка /edit «Реквизиты для КП»: логотип и текст для шапки КП.
 * Одинакова для всех ролей — у администратора свои реквизиты, как у всех.
 * Компонент без собственного состояния — иначе черновик терялся бы
 * при переключении вкладок (компонент размонтируется).
 * См. docs/superpowers/plans/2026-09-14-white-label-branding-plan.md
 */
export default function BrandingCard({
    draft,
    onChange,
    onSave,
    canSave,
    onReset,
    canReset,
    isSaving,
    status,
}: BrandingCardProps) {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const [fileError, setFileError] = React.useState('');
    const [isProcessing, setIsProcessing] = React.useState(false);

    const measure = measureBrandingText(draft.text);
    const charsOver = measure.chars > BRANDING_LIMITS.textChars;
    const linesOver = measure.lines > BRANDING_LIMITS.textLines;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Сброс value — иначе повторный выбор того же файла не вызовет onChange.
        event.target.value = '';
        if (!file) {
            return;
        }
        if (!ACCEPTED_TYPES.has(file.type)) {
            setFileError('Поддерживаются PNG, JPEG и SVG.');
            return;
        }
        setFileError('');
        setIsProcessing(true);
        compressLogo(file)
            .then((dataUrl) => onChange({ logo: { dataUrl } }))
            .catch((error: unknown) => {
                setFileError(
                    error instanceof LogoCompressError
                        ? error.message
                        : 'Не удалось обработать изображение.',
                );
            })
            .finally(() => setIsProcessing(false));
    };

    return (
        <div className='mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-5'>
            <h2 className='mb-1 text-base font-semibold text-slate-900'>
                Логотип и реквизиты для КП
            </h2>
            <p className='mb-5 text-sm text-slate-500'>
                Эти данные ваш заказчик увидит в шапке КП. Пока не заполнено —
                на КП стоит стандартная шапка Калькулятора.
            </p>

            <div className='mb-5'>
                <span className='mb-2 block text-xs uppercase tracking-wide text-slate-500'>
                    Логотип
                </span>
                <div className='flex items-center gap-4'>
                    <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50'>
                        <img
                            src={draft.logo ? draft.logo.dataUrl : DEFAULT_LOGO_EMBLEM_SRC}
                            alt={draft.logo ? 'Ваш логотип' : 'Стандартный логотип'}
                            className='h-full w-full object-contain p-2'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/png,image/jpeg,image/svg+xml'
                            className='hidden'
                            onChange={handleFileChange}
                        />
                        <div className='flex flex-wrap gap-2'>
                            <Button
                                size={32}
                                variant='secondary'
                                type='button'
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSaving || isProcessing}
                                children={
                                    isProcessing
                                        ? 'Обрабатываем...'
                                        : draft.logo
                                          ? 'Заменить'
                                          : 'Загрузить'
                                }
                                backgroundSecondary={false}
                            />
                            {draft.logo ? (
                                <Button
                                    size={32}
                                    variant='ghost'
                                    type='button'
                                    onClick={() => {
                                        setFileError('');
                                        onChange({ logo: null });
                                    }}
                                    disabled={isSaving || isProcessing}
                                    children='Убрать'
                                    backgroundSecondary={false}
                                />
                            ) : null}
                        </div>
                        <p className='text-xs text-slate-500'>
                            {draft.logo
                                ? 'Ваш логотип'
                                : 'Стандартная эмблема Калькулятора'}
                            . PNG, JPEG или SVG — будет уменьшен до{' '}
                            {BRANDING_LIMITS.logoMaxSide} px.
                        </p>
                        {fileError ? (
                            <p className='text-xs text-red-600' role='alert'>
                                {fileError}
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className='mb-2'>
                <label
                    htmlFor='branding-text'
                    className='mb-2 block text-xs uppercase tracking-wide text-slate-500'>
                    Реквизиты
                </label>
                <textarea
                    id='branding-text'
                    className={`w-full resize-y rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none ${
                        measure.isValid
                            ? 'border-slate-200 focus:border-[#54b0bf]'
                            : 'border-red-400 focus:border-red-500'
                    }`}
                    rows={6}
                    placeholder={TEXT_PLACEHOLDER}
                    value={draft.text}
                    onChange={(event) => onChange({ text: event.target.value })}
                    aria-invalid={!measure.isValid}
                    aria-describedby='branding-text-hint branding-text-counter'
                    spellCheck={false}
                />
                <div className='mt-1 flex items-start justify-between gap-4 text-xs'>
                    <p id='branding-text-hint' className='text-slate-500'>
                        Первая строка выделяется как название компании. До{' '}
                        {BRANDING_LIMITS.textLines} строк.
                    </p>
                    <p
                        id='branding-text-counter'
                        className='shrink-0 tabular-nums text-slate-500'
                        aria-live='polite'>
                        <span className={charsOver ? 'font-semibold text-red-600' : ''}>
                            {measure.chars} / {BRANDING_LIMITS.textChars}
                        </span>
                        {' · '}
                        <span className={linesOver ? 'font-semibold text-red-600' : ''}>
                            {measure.lines} / {BRANDING_LIMITS.textLines} строк
                        </span>
                    </p>
                </div>
            </div>

            <div className='mt-5'>
                <BrandingPreview draft={draft} />
            </div>

            <div className='mt-5 flex flex-col gap-3'>
                <Button
                    className='w-full'
                    size={52}
                    variant='primary'
                    type='button'
                    onClick={onSave}
                    disabled={!canSave}
                    children={isSaving ? 'Сохраняем...' : 'Сохранить'}
                    backgroundSecondary={false}
                />
                {canReset ? (
                    <Button
                        className='self-start'
                        size={32}
                        variant='ghost'
                        type='button'
                        onClick={onReset}
                        disabled={isSaving}
                        children='Вернуть стандартные'
                        backgroundSecondary={false}
                    />
                ) : null}
                {status ? (
                    <p
                        role='status'
                        className={`text-sm ${
                            status.type === 'success'
                                ? 'text-emerald-700'
                                : 'text-red-600'
                        }`}>
                        {status.text}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
