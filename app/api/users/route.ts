import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import { Db } from 'mongodb';

export async function GET() {
    const { db } = await getDb(clientPromise, null);
    try {
        return NextResponse.json(await getUsers(db));
    } catch (error) {
        return NextResponse.json({ message: 'Error' });
    }
}

const getUsers = async (db: Db) => {
    const user = await db.collection('user').find().toArray();
    return user;
};
