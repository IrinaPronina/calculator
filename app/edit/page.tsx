import ChoiceType from '../components/choiceType/choiceType';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import {
    getCurrentUser,
    getGlobalTemplate,
    getOrCreateUserSettings,
} from '@/app/utils/settings';
import type { SettingsType, SettingsMode } from '@/app/models/adminDataTypes';

async function loadEditData(): Promise<{
    settings: SettingsType;
    template: SettingsType;
    mode: SettingsMode;
    isAdmin: boolean;
    warning: string;
}> {
    const fallbackMessage =
        'База данных недоступна. Используются настройки по умолчанию.';

    const user = await getCurrentUser();
    if (!user) {
        // Гость без куки сюда не попадёт (middleware). Если попали —
        // кука есть, а сессии в базе нет: стираем куку, иначе
        // middleware будет гонять /login <-> /edit по кругу.
        redirect('/api/auth/clear-stale?next=/edit');
    }

    try {
        const { db } = await getDb(clientPromise, null);
        const [settings, template] = await Promise.all([
            getOrCreateUserSettings(db, user),
            getGlobalTemplate(db),
        ]);
        return {
            settings,
            template,
            mode: settings.mode,
            isAdmin: user.role === 'admin',
            warning: '',
        };
    } catch (error) {
        console.error('Error loading edit data:', error);
        const empty: SettingsType = {
            general: { rate: 0, overheads: 0, profit: 0 },
            pay: [],
            materials: [],
            exp: [],
            version: 0,
        };
        return {
            settings: empty,
            template: empty,
            mode: 'own',
            isAdmin: user.role === 'admin',
            warning: fallbackMessage,
        };
    }
}

async function EditPage() {
    const { settings, template, mode, isAdmin, warning } = await loadEditData();

    return (
        <>
            <div className='mb-4 flex items-center justify-end gap-4'>
                <Link
                    href='/'
                    className='text-sm font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800'>
                    Перейти к рассчету
                </Link>
            </div>
            {warning ? (
                <div className='mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
                    {warning}
                </div>
            ) : null}
            <ChoiceType
                settings={settings}
                template={template}
                mode={mode}
                isAdmin={isAdmin}
            />
        </>
    );
}

export default EditPage;
