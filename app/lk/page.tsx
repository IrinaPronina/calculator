import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/lib/auth';
import { getUserSafe } from '@/app/utils/user';
import LkClient from './LkClient';

export default async function LkPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const email = String(session?.user?.email || '').trim();

    if (!email) {
        redirect('/login');
    }

    const user = await getUserSafe(email);
    const initialName = String(user?.name || '').trim();
    const initialEmail = String(user?.email || email).trim();

    return <LkClient initialName={initialName} initialEmail={initialEmail} />;
}
