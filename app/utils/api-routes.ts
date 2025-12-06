import { MongoClient } from 'mongodb';

export const getDb = async (
    clientPromise: Promise<MongoClient>,
    req: Request | null
) => {
    const db = (await clientPromise).db(process.env.DB_NAME);

    if (req) {
        const reqBody = await req.json();
        return { db, reqBody };
    }
    return { db };
};
