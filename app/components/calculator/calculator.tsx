//isr
import Form from '../ form/Form';
import { SettingsType, SettingsMode } from '@/app/models/adminDataTypes';
import ConcreteCalcStore from '@/app/stores/concrete-calc.store';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import {
    getCurrentUser,
    getGlobalTemplate,
    getOrCreateUserSettings,
} from '@/app/utils/settings';
import CalcModeToggle from './CalcModeToggle';
import { resolveBranding } from '@/app/utils/branding';
import { DEFAULT_BRANDING, type Branding } from '@/app/constants/branding';

let loading = false;

const DEFAULT_SETTINGS: SettingsType = {
    general: { rate: 0, overheads: 0, profit: 0 },
    pay: [],
    materials: [],
    exp: [],
    version: 0,
};

const formatUpdatedDate = (isoDate?: string): string => {
    if (!isoDate) {
        return 'дата не указана';
    }

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
        return 'дата не указана';
    }

    return new Intl.DateTimeFormat('ru-RU').format(date);
};

async function loadSettings(): Promise<{
    settings: SettingsType[];
    warning: string;
    isAuthenticated: boolean;
    mode: SettingsMode;
    /** Чья шапка в скачиваемом КП. */
    branding: Branding;
}> {
    const fallbackMessage =
        'База данных недоступна. Используются настройки по умолчанию.';
    try {
        loading = true;
        const user = await getCurrentUser();
        const { db } = await getDb(clientPromise, null);

        // Гость → шаблон. Залогинен → свои либо живой шаблон по режиму.
        if (!user) {
            const template = await getGlobalTemplate(db);
            return {
                settings: [template],
                warning: '',
                isAuthenticated: false,
                mode: 'own',
                branding: DEFAULT_BRANDING,
            };
        }

        const userSettings = await getOrCreateUserSettings(db, user);
        const effective =
            userSettings.mode === 'global'
                ? await getGlobalTemplate(db)
                : userSettings;

        return {
            settings: [effective],
            warning: '',
            isAuthenticated: true,
            mode: userSettings.mode,
            branding: resolveBranding(user),
        };
    } catch (error) {
        console.error('Error loading settings:', error);
        return {
            settings: [DEFAULT_SETTINGS],
            warning: fallbackMessage,
            isAuthenticated: false,
            mode: 'own',
            branding: DEFAULT_BRANDING,
        };
    } finally {
        loading = false;
    }
}

async function Calculator() {
    const { settings, warning, isAuthenticated, mode, branding } =
        await loadSettings();
    ConcreteCalcStore.fetchConcreteCalcSettings(settings);
    const updatedDate = formatUpdatedDate(settings[0]?.updatedAt);

    return (
        <section>
            {warning ? (
                <div className='mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
                    {warning}
                </div>
            ) : null}
            {isAuthenticated ? <CalcModeToggle mode={mode} /> : null}
            <h2 className='py-2.5 mb-2.5 text-2xl font-Exo2Bold text-primary md:text-3xl'>
                {`Расчет стоимости бетонных полов (цены обновлены ${updatedDate} г.)`}
            </h2>
            <Form settings={settings} loading={loading} branding={branding} />
        </section>
    );
}

export default Calculator;
