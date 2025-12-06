//isr
import ChoiceType from '../components/choiceType/choiceType';
import { SettingsType } from '@/app/models/adminDataTypes';

async function fetchSettings() {
    try {
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
        return data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
}

async function EditPage() {
    const settings = await fetchSettings();

    return settings ? <ChoiceType settings={settings[0]} /> : null;
}

export default EditPage;
