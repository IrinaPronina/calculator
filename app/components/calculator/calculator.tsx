//isr
// import React from 'react';
import Form from '../ form/Form';
import { SettingsType } from '@/app/models/adminDataTypes';
import ConcreteCalcStore from '@/app/stores/concrete-calc.store';
let loading = false;
async function fetchSettings() {
    try {
        loading = true;
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/settings`, {
            //cache for 1 day
            next: {
                revalidate: 86400,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch settings');
        }
        const data: SettingsType[] = await response.json();
        loading = false;
        return data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    } finally {
        loading = false;
    }
}

async function Calculator() {
    const settings = await fetchSettings();
    ConcreteCalcStore.fetchConcreteCalcSettings(settings);
    console.log(ConcreteCalcStore.settings);
    return (
        <section>
            <h2 className='py-2.5 mb-2.5 text-2xl font-Exo2Bold text-primary md:text-3xl'>
                Расчет стоимости бетонных полов (цены обновлены 20.06.2025г.)
            </h2>
            <Form settings={settings} loading={loading} />
        </section>
    );
}

export default Calculator;
