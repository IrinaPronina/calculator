//isr
// import React from 'react';
import Form from '../ form/Form';
import { SettingsType } from '@/app/models/adminDataTypes';
import ConcreteCalcStore from '@/app/stores/concrete-calc.store';
import { headers } from 'next/headers';
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

async function fetchSettings() {
    const fallbackMessage = 'База данных недоступна. Используются настройки по умолчанию.';
    try {
        loading = true;
        const hdrs = await headers();
        const protocol = hdrs.get('x-forwarded-proto') || 'http';
        const host = hdrs.get('x-forwarded-host') || hdrs.get('host');
        const dynamicBaseUrl = host ? `${protocol}://${host}` : null;
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL ||
            dynamicBaseUrl ||
            'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/settings`, {
            cache: 'no-store',
        });
        if (!response.ok) {
            console.error('Error fetching settings: non-200 response');
            return { settings: [DEFAULT_SETTINGS], warning: fallbackMessage };
        }
        const json: {
            status: 'success' | 'error';
            data?: SettingsType;
            errors?: string[];
            warnings?: string[];
        } = await response.json();
        if (json.status !== 'success' || !json.data) {
            console.error(
                'Error fetching settings:',
                json.errors?.join(' ') || 'Failed to fetch settings',
            );
            return { settings: [DEFAULT_SETTINGS], warning: fallbackMessage };
        }
        const data: SettingsType[] = [json.data];
        loading = false;
        return {
            settings: data,
            warning: json.warnings?.[0] || '',
        };
    } catch (error) {
        console.error('Error fetching settings:', error);
        return { settings: [DEFAULT_SETTINGS], warning: fallbackMessage };
    } finally {
        loading = false;
    }
}

async function Calculator() {
    const { settings, warning } = await fetchSettings();
    ConcreteCalcStore.fetchConcreteCalcSettings(settings);
    console.log(ConcreteCalcStore.settings);
    const updatedDate = formatUpdatedDate(settings[0]?.updatedAt);

    return (
        <section>
            {warning ? (
                <div className='mb-4 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
                    {warning}
                </div>
            ) : null}
            <h2 className='py-2.5 mb-2.5 text-2xl font-Exo2Bold text-primary md:text-3xl'>
                {`Расчет стоимости бетонных полов (цены обновлены ${updatedDate} г.)`}
            </h2>
            <Form settings={settings} loading={loading} />
        </section>
    );
}

export default Calculator;
