'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../Simple/Button/Button';
import GeneralTable from '../GeneralTable/GeneralTable';
import PayTable from '../PayTable/PayTable';
import MaterialTable from '../MaterialTable/MaterialTable';
import ExpTable from '../ExpTable/ExpTable';
import { SettingsType } from '@/app/models/adminDataTypes';
import { TABS } from './tabs.data';
import BrandingCard, {
    measureBrandingText,
    type BrandingSaveStatus,
} from '../branding/BrandingCard';
import type { Branding } from '@/app/constants/branding';
import { isBrandingFilled } from '@/app/utils/branding';

interface TabButtonTypes {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = (props: TabButtonTypes) => (
    <div
        className={`relative p-2 text-base text-center w-56 border-solid border-1 hover:cursor-pointer ${
            props.isActive
                ? 'border-[#54b0bf] color-primary'
                : 'border-[#a3a3a3]'
        }`}
        onClick={props.onClick}>
        {props.label}
    </div>
);

interface ConcreteTypeProps {
    settings: SettingsType;
    /** Только просмотр (например, шаблон администратора для обычного юзера). */
    readOnly?: boolean;
    /** Куда сохранять: свои настройки ('own') или глобальный шаблон ('global', admin). */
    scope?: 'own' | 'global';
    /** Бренд пользователя для вкладки «Реквизиты для КП»; null — фирменный. */
    initialBranding: Branding | null;
}

type EditableRow = {
    id: string;
    name: string;
    price: number;
    increase: number;
};

const toComparableSettings = (settings: SettingsType) =>
    JSON.stringify({
        general: settings.general,
        pay: settings.pay,
        materials: settings.materials,
        exp: settings.exp,
        formula: settings.formula,
    });

const ConcreteType = (props: ConcreteTypeProps) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('general');
    const [draftSettings, setDraftSettings] = useState<SettingsType>(
        props.settings,
    );
    const [savedSettings, setSavedSettings] = useState<SettingsType>(
        props.settings,
    );
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const isDirty =
        toComparableSettings(draftSettings) !== toComparableSettings(savedSettings);
    // Реквизиты сохраняются своей кнопкой через /api/lk/branding
    // и не зависят от режима own/global.
    const isBrandingTab = activeTab === 'branding';

    // Черновик реквизитов живёт здесь, а не в BrandingCard: карточка
    // размонтируется при смене вкладки и потеряла бы напечатанное.
    const emptyBranding: Branding = { logo: null, text: '' };
    const [draftBranding, setDraftBranding] = useState<Branding>(
        props.initialBranding ?? emptyBranding,
    );
    const [savedBranding, setSavedBranding] = useState<Branding>(
        props.initialBranding ?? emptyBranding,
    );
    const [isBrandingSaving, setIsBrandingSaving] = useState(false);
    const [brandingStatus, setBrandingStatus] =
        useState<BrandingSaveStatus>(null);
    const isBrandingDirty =
        JSON.stringify(draftBranding) !== JSON.stringify(savedBranding);
    const hasUnsavedChanges = isDirty || isBrandingDirty;
    const canSaveBranding =
        isBrandingDirty &&
        !isBrandingSaving &&
        measureBrandingText(draftBranding.text).isValid;
    // Сбрасывать есть что, только если в базе (savedBranding) что-то лежит.
    const canResetBranding = isBrandingFilled(savedBranding) && !isBrandingSaving;

    const handleBrandingChange = (patch: Partial<Branding>) => {
        if (brandingStatus) {
            setBrandingStatus(null);
        }
        setDraftBranding((prev) => ({ ...prev, ...patch }));
    };

    /**
     * Шапка сайта берёт бренд на сервере (layout.tsx), поэтому после
     * сохранения перечитываем серверные компоненты. Но refresh отдаёт новый
     * props.settings, а на него подписан сброс draftSettings — несохранённые
     * правки цен пропали бы. Поэтому обновляем, только если таблицы чистые;
     * иначе шапка подтянется при следующем переходе.
     */
    const refreshHeaderIfSafe = () => {
        if (!isDirty) {
            router.refresh();
        }
    };

    const handleSaveBranding = async () => {
        if (!canSaveBranding) {
            return;
        }
        setIsBrandingSaving(true);
        setBrandingStatus(null);
        try {
            const response = await fetch('/api/lk/branding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draftBranding),
            });
            const json: {
                status: 'success' | 'error';
                data?: Branding | null;
                errors?: string[];
            } = await response.json();

            if (!response.ok || json.status !== 'success') {
                throw new Error(
                    json.errors?.join(' ') || 'Не удалось сохранить реквизиты',
                );
            }

            // Сервер возвращает нормализованный текст (без \r\n и хвостов);
            // null — сброс на фирменные, если всё оказалось пустым.
            const next = json.data ?? emptyBranding;
            setDraftBranding(next);
            setSavedBranding(next);
            setBrandingStatus({ type: 'success', text: 'Сохранено' });
            refreshHeaderIfSafe();
        } catch (error) {
            setBrandingStatus({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'Не удалось сохранить реквизиты',
            });
        } finally {
            setIsBrandingSaving(false);
        }
    };

    const handleResetBranding = async () => {
        if (!canResetBranding) {
            return;
        }
        setIsBrandingSaving(true);
        setBrandingStatus(null);
        try {
            const response = await fetch('/api/lk/branding', {
                method: 'DELETE',
            });
            const json: { status: 'success' | 'error'; errors?: string[] } =
                await response.json();
            if (!response.ok || json.status !== 'success') {
                throw new Error(
                    json.errors?.join(' ') ||
                        'Не удалось вернуть стандартные реквизиты',
                );
            }
            setDraftBranding(emptyBranding);
            setSavedBranding(emptyBranding);
            setBrandingStatus({
                type: 'success',
                text: 'Возвращены стандартные реквизиты',
            });
            refreshHeaderIfSafe();
        } catch (error) {
            setBrandingStatus({
                type: 'error',
                text:
                    error instanceof Error
                        ? error.message
                        : 'Не удалось вернуть стандартные реквизиты',
            });
        } finally {
            setIsBrandingSaving(false);
        }
    };

    useEffect(() => {
        if (brandingStatus?.type !== 'success') {
            return;
        }
        const timer = window.setTimeout(() => setBrandingStatus(null), 3000);
        return () => window.clearTimeout(timer);
    }, [brandingStatus]);

    const handleClickTab = (value: string) => {
        setActiveTab(value);
    };

    useEffect(() => {
        setDraftSettings(props.settings);
        setSavedSettings(props.settings);
    }, [props.settings]);

    useEffect(() => {
        const next = props.initialBranding ?? { logo: null, text: '' };
        setDraftBranding(next);
        setSavedBranding(next);
    }, [props.initialBranding]);

    useEffect(() => {
        if (!hasUnsavedChanges) {
            return;
        }

        const confirmText =
            'Есть несохраненные изменения. Вы уверены, что хотите уйти со страницы?';

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
            if (!anchor) {
                return;
            }

            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#') || anchor.target === '_blank') {
                return;
            }

            if (!window.confirm(confirmText)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleDocumentClick, true);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleDocumentClick, true);
        };
    }, [hasUnsavedChanges]);

    const handleChangeGeneral = (
        patch: Partial<{ rate: number; overheads: number; profit: number }>,
    ) => {
        if (saveMessage) {
            setSaveMessage('');
        }
        setDraftSettings((prev) => ({
            ...prev,
            general: {
                ...prev.general,
                ...patch,
            },
        }));
    };

    const handleItemChange = (
        section: 'pay' | 'materials' | 'exp',
        id: string,
        patch: { price?: number; increase?: number },
    ) => {
        if (saveMessage) {
            setSaveMessage('');
        }
        setDraftSettings((prev) => ({
            ...prev,
            [section]: prev[section].map((item) =>
                item.id === id ? { ...item, ...patch } : item,
            ),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');

        try {
            const settingsUrl =
                props.scope === 'global'
                    ? '/api/settings?scope=global'
                    : '/api/settings';

            const putSettings = async (payload: SettingsType) => {
                const response = await fetch(settingsUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const json: {
                    status: 'success' | 'error';
                    data?: { version: number; updatedAt: string };
                    errors?: string[];
                } = await response.json();

                return { response, json };
            };

            const buildSectionPayload = (
                baseRows: EditableRow[],
                draftRows: EditableRow[],
            ): EditableRow[] => {
                const byId = new Map(draftRows.map((row) => [row.id, row]));
                return baseRows.map((base) => {
                    const draft = byId.get(base.id);
                    return {
                        id: base.id,
                        name: base.name,
                        price: draft ? Number(draft.price) : Number(base.price),
                        increase: draft
                            ? Number(draft.increase)
                            : Number(base.increase),
                    };
                });
            };

            if (
                savedSettings.pay.length === 0 ||
                savedSettings.materials.length === 0 ||
                savedSettings.exp.length === 0
            ) {
                throw new Error(
                    'Справочники pay/materials/exp пустые. Сначала восстановите данные миграцией.',
                );
            }

            const payload: SettingsType = {
                ...savedSettings,
                general: {
                    rate: Number(draftSettings.general.rate),
                    overheads: Number(draftSettings.general.overheads),
                    profit: Number(draftSettings.general.profit),
                },
                pay: buildSectionPayload(savedSettings.pay, draftSettings.pay),
                materials: buildSectionPayload(
                    savedSettings.materials,
                    draftSettings.materials,
                ),
                exp: buildSectionPayload(savedSettings.exp, draftSettings.exp),
                version: savedSettings.version,
            };
            let { response, json } = await putSettings(payload);

            if (response.status === 409) {
                const latestResponse = await fetch(settingsUrl, {
                    method: 'GET',
                    cache: 'no-store',
                });
                const latestJson: {
                    status: 'success' | 'error';
                    data?: SettingsType;
                    errors?: string[];
                } = await latestResponse.json();

                if (latestResponse.ok && latestJson.status === 'success' && latestJson.data) {
                    const retryPayload: SettingsType = {
                        ...payload,
                        version: latestJson.data.version,
                    };
                    ({ response, json } = await putSettings(retryPayload));
                }
            }

            const saveResult: {
                status: 'success' | 'error';
                data?: { version: number; updatedAt: string };
                errors?: string[];
            } = json;

            if (!response.ok || saveResult.status !== 'success' || !saveResult.data) {
                throw new Error(
                    saveResult.errors?.join(' ') || 'Ошибка сохранения настроек',
                );
            }

            setDraftSettings((prev) => ({
                ...prev,
                version: saveResult.data?.version,
                updatedAt: saveResult.data?.updatedAt,
            }));
            setSavedSettings((prev) => ({
                ...prev,
                ...payload,
                version: saveResult.data?.version,
                updatedAt: saveResult.data?.updatedAt,
            }));
            setSaveMessage('Настройки сохранены');
        } catch (error) {
            const msg =
                error instanceof Error
                    ? error.message
                    : 'Ошибка сохранения настроек';
            setSaveMessage(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex flex-col gap-6 w-full'>
            <div className='flex gap-3 flex-col items-center md:flex-row md:flex-wrap md:justify-center'>
                {TABS.map((tab) => (
                    <TabButton
                        key={tab.label}
                        label={tab.label}
                        isActive={activeTab === tab.title}
                        onClick={() => handleClickTab(tab.title)}
                    />
                ))}
            </div>
            {!props.readOnly && !isBrandingTab ? (
                <div className='concrete-type__btn flex items-center gap-4 flex-wrap'>
                    <Button
                        size={32}
                        variant={'primary'}
                        type={'button'}
                        onClick={handleSave}
                        disabled={isSaving || !isDirty}
                        children={'Сохранить'}
                        backgroundSecondary={false}></Button>
                    {isDirty ? (
                        <div className='text-sm text-amber-700'>
                            Есть несохраненные изменения
                        </div>
                    ) : null}
                    {saveMessage ? (
                        <div className='text-sm text-neutral-700'>
                            {saveMessage}
                        </div>
                    ) : null}
                </div>
            ) : null}
            <fieldset
                disabled={props.readOnly}
                className='contents border-0 p-0 m-0'>
                {activeTab === 'general' && (
                    <GeneralTable
                        settings={draftSettings}
                        onChange={handleChangeGeneral}
                    />
                )}
                {activeTab === 'material' && (
                    <MaterialTable
                        settings={draftSettings}
                        onItemChange={(id, patch) =>
                            handleItemChange('materials', id, patch)
                        }
                    />
                )}
                {activeTab === 'pay' && (
                    <PayTable
                        settings={draftSettings}
                        onItemChange={(id, patch) =>
                            handleItemChange('pay', id, patch)
                        }
                    />
                )}
                {activeTab === 'exp' && (
                    <ExpTable
                        settings={draftSettings}
                        onItemChange={(id, patch) =>
                            handleItemChange('exp', id, patch)
                        }
                    />
                )}
            </fieldset>
            {isBrandingTab ? (
                <BrandingCard
                    draft={draftBranding}
                    onChange={handleBrandingChange}
                    onSave={handleSaveBranding}
                    canSave={canSaveBranding}
                    onReset={handleResetBranding}
                    canReset={canResetBranding}
                    isSaving={isBrandingSaving}
                    status={brandingStatus}
                />
            ) : null}
        </div>
    );
};

export default ConcreteType;
