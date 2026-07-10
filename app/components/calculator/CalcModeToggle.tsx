'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SettingsMode } from '@/app/models/adminDataTypes';

interface CalcModeToggleProps {
    mode: SettingsMode;
}

const CalcModeToggle = (props: CalcModeToggleProps) => {
    const router = useRouter();
    const [mode, setMode] = useState<SettingsMode>(props.mode);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const change = async (next: SettingsMode) => {
        if (next === mode || isSaving) {
            return;
        }
        const prev = mode;
        setMode(next);
        setIsSaving(true);
        setError('');
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: next }),
            });
            if (!response.ok) {
                throw new Error('failed');
            }
            // Перерендер серверного компонента с новым источником настроек.
            router.refresh();
        } catch {
            setMode(prev);
            setError('Не удалось переключить режим');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='mb-4 flex items-center gap-3 flex-wrap'>
            <span className='text-sm text-neutral-600'>Источник цен:</span>
            <div className='flex gap-2'>
                <button
                    type='button'
                    onClick={() => change('global')}
                    disabled={isSaving}
                    className={`px-3 py-1.5 text-sm border-solid border-1 rounded ${
                        mode === 'global'
                            ? 'border-[#54b0bf] color-primary'
                            : 'border-[#a3a3a3]'
                    }`}>
                    Цены по дефолту
                </button>
                <button
                    type='button'
                    onClick={() => change('own')}
                    disabled={isSaving}
                    className={`px-3 py-1.5 text-sm border-solid border-1 rounded ${
                        mode === 'own'
                            ? 'border-[#54b0bf] color-primary'
                            : 'border-[#a3a3a3]'
                    }`}>
                    Мои значения
                </button>
            </div>
            {error ? (
                <span className='text-sm text-amber-700'>{error}</span>
            ) : null}
        </div>
    );
};

export default CalcModeToggle;
