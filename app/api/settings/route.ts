import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import { Db } from 'mongodb';

export async function GET() {
    const { db } = await getDb(clientPromise, null);
    try {
        return NextResponse.json(await getSettings(db));
    } catch (error) {
        return NextResponse.json({ message: 'Error' });
    }
}

const getSettings = async (db: Db) => {
    const settings = await db.collection('settings').find().toArray();

    return settings;
};
