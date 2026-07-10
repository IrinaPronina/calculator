'use client';
import { useState } from 'react';
import Tab from '../Simple/Tab/Tab';
import ConcreteType from '../concreteType/concreteType';
import { SettingsType, SettingsMode } from '@/app/models/adminDataTypes';
import { TABS } from './tabs.data';

interface ChoiceTypeProps {
    settings: SettingsType;
    template: SettingsType;
    mode: SettingsMode;
    isAdmin: boolean;
}

const ChoiceType = (props: ChoiceTypeProps) => {
    const [activeTab, setActiveTab] = useState<string>('concrete');
    // Источник = персональный режим расчёта (own/global). Сохраняется в БД.
    const [source, setSource] = useState<SettingsMode>(props.mode);
    const [modeMsg, setModeMsg] = useState('');
    const [isSwitching, setIsSwitching] = useState(false);

    const handleTabClick = (value: string) => {
        setActiveTab(value);
    };

    const handleSourceChange = async (next: SettingsMode) => {
        if (next === source || isSwitching) {
            return;
        }
        const prev = source;
        setSource(next);
        setIsSwitching(true);
        setModeMsg('');
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: next }),
            });
            if (!response.ok) {
                throw new Error('Не удалось сохранить режим');
            }
            setModeMsg(
                next === 'global'
                    ? 'Расчёт ведётся по ценам по дефолту'
                    : 'Расчёт ведётся по вашим значениям',
            );
        } catch {
            setSource(prev);
            setModeMsg('Не удалось переключить режим');
        } finally {
            setIsSwitching(false);
        }
    };

    const isGlobalView = source === 'global';
    // В режиме «шаблон» обычный пользователь видит read-only;
    // админ редактирует глобальный шаблон.
    const concreteSettings = isGlobalView ? props.template : props.settings;
    const readOnly = isGlobalView && !props.isAdmin;
    const scope: 'own' | 'global' =
        isGlobalView && props.isAdmin ? 'global' : 'own';

    return (
        <section className='py-5 admin'>
            <div className='flex justify-between items-start gap-6 flex-col'>
                <div className='w-full flex flex-col items-center gap-2 mb-2'>
                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={() => handleSourceChange('global')}
                            disabled={isSwitching}
                            className={`px-4 py-2 text-sm border-solid border-1 rounded ${
                                source === 'global'
                                    ? 'border-[#54b0bf] color-primary'
                                    : 'border-[#a3a3a3]'
                            }`}>
                            Цены по дефолту
                        </button>
                        <button
                            type='button'
                            onClick={() => handleSourceChange('own')}
                            disabled={isSwitching}
                            className={`px-4 py-2 text-sm border-solid border-1 rounded ${
                                source === 'own'
                                    ? 'border-[#54b0bf] color-primary'
                                    : 'border-[#a3a3a3]'
                            }`}>
                            Мои значения
                        </button>
                    </div>
                    {modeMsg ? (
                        <div className='text-sm text-neutral-700'>{modeMsg}</div>
                    ) : null}
                    {isGlobalView && !props.isAdmin ? (
                        <div className='text-xs text-neutral-500'>
                            Просмотр цен по дефолту (только чтение).
                        </div>
                    ) : null}
                    {isGlobalView && props.isAdmin ? (
                        <div className='text-xs text-amber-700'>
                            Режим редактирования цен по дефолту.
                        </div>
                    ) : null}
                </div>
                <div className='w-full flex justify-center gap-6 mb-6'>
                    {TABS.map((tab) => (
                        <Tab
                            key={tab.title}
                            className={
                                activeTab === tab.title ? 'color-primary' : ''
                            }
                            size={32}
                            activeTab={activeTab}
                            onClick={() => handleTabClick(tab.title)}
                            variant={'stroke'}
                            eventKey={tab.title}>
                            {tab.label}
                        </Tab>
                    ))}
                </div>
                {activeTab === 'concrete' && (
                    <ConcreteType
                        settings={concreteSettings}
                        readOnly={readOnly}
                        scope={scope}
                    />
                )}
                {activeTab === 'polymer' && <></>}
            </div>
        </section>
    );
};

export default ChoiceType;
