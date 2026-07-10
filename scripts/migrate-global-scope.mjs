// Разовая миграция: пометить существующий глобальный шаблон scope:'global'.
// Идемпотентна — повторный прогон ничего не меняет.
//
// Запуск:  node scripts/migrate-global-scope.mjs
import { MongoClient } from 'mongodb';

const uri = process.env.DB_URL;
const dbName = process.env.DB_NAME;

if (!uri) {
    throw new Error('DB_URL is not set');
}
if (!dbName) {
    throw new Error('DB_NAME is not set');
}

const client = new MongoClient(uri, { maxPoolSize: 10 });

try {
    await client.connect();
    const db = client.db(dbName);

    const result = await db
        .collection('settings')
        .updateMany(
            { scope: { $exists: false } },
            { $set: { scope: 'global' } },
        );

    console.log(
        `settings: matched ${result.matchedCount}, updated ${result.modifiedCount} (scope:'global').`,
    );

    const total = await db.collection('settings').countDocuments({});
    const global = await db
        .collection('settings')
        .countDocuments({ scope: 'global' });
    console.log(`settings total: ${total}, scope=global: ${global}.`);
} finally {
    await client.close();
}
