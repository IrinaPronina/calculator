export type DbUser = {
    _id: { toString(): string };
    email: string;
    password: string;
    role?: string;
    name?: string;
};

export async function getUserFromDb(email: string): Promise<DbUser | null> {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
        return null;
    }

    const { default: clientPromise } = await import('@/lib/mongodb');
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    return db.collection<DbUser>('user').findOne({
        $or: [{ email: normalizedEmail }, { email: email.trim() }],
    });
}
