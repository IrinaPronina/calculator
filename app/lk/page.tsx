import { redirect } from 'next/navigation';
import { auth } from '@/app/auth';
import { getUserFromDb } from '@/app/utils/user';
import LkClient from './LkClient';

export default async function LkPage() {
    const session = await auth();
    const email = String(session?.user?.email || '').trim();

    if (!email) {
        redirect('/login');
    }

    const user = await getUserFromDb(email);
    const initialName = String(user?.name || '').trim();
    const initialEmail = String(user?.email || email).trim();

    return <LkClient initialName={initialName} initialEmail={initialEmail} />;
}
