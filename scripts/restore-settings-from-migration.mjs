import { MongoClient } from 'mongodb';
import migrationModule from '../migrations/20250606124153-settings.js';

const uri = process.env.DB_URL;
const dbName = process.env.DB_NAME;

if (!uri) {
    throw new Error('DB_URL is not set');
}

if (!dbName) {
    throw new Error('DB_NAME is not set');
}

const captureDb = {
    payload: null,
    collection(name) {
        if (name !== 'settings') {
            throw new Error(`Unexpected collection requested by migration: ${name}`);
        }

        return {
            insertOne: async (doc) => {
                this.payload = doc;
            },
        };
    },
};

await migrationModule.up(captureDb, null);

if (!captureDb.payload) {
    throw new Error('Migration did not produce a settings payload');
}

const client = new MongoClient(uri, { maxPoolSize: 10 });

try {
    await client.connect();
    const db = client.db(dbName);
    const existing = await db.collection('settings').findOne({});
    const version = Number(existing?.version || 0) + 1;
    const updatedAt = new Date().toISOString();

    await db.collection('settings').updateOne(
        { _id: existing?._id ?? 'default' },
        {
            $set: {
                ...captureDb.payload,
                version,
                updatedAt,
            },
        },
        { upsert: true },
    );

    const saved = await db.collection('settings').findOne({});

    console.log(
        JSON.stringify(
            {
                status: 'success',
                version: saved?.version,
                updatedAt: saved?.updatedAt,
                payCount: Array.isArray(saved?.pay) ? saved.pay.length : 0,
                materialsCount: Array.isArray(saved?.materials)
                    ? saved.materials.length
                    : 0,
                expCount: Array.isArray(saved?.exp) ? saved.exp.length : 0,
            },
            null,
            2,
        ),
    );
} finally {
    await client.close();
}
