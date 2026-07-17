// Сброс пароля пользователя по email.
// Использование:
//   DB_URL=mongodb://localhost:27017 DB_NAME=calculator \
//     node scripts/reset-password.mjs user@example.com 'НовыйПароль123'
//
// Пароль хэшируется bcrypt — auth.ts верифицирует такие хэши и при первом
// входе сам перехэширует в scrypt.

import { MongoClient } from 'mongodb';
import bcryptjs from 'bcryptjs';

const [, , emailArg, newPassword] = process.argv;

if (!emailArg || !newPassword) {
    console.error('Использование: node scripts/reset-password.mjs <email> <новый пароль>');
    process.exit(1);
}
if (newPassword.length < 8) {
    console.error('Пароль должен быть не короче 8 символов.');
    process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const client = new MongoClient(process.env.DB_URL || 'mongodb://localhost:27017');

try {
    const db = client.db(process.env.DB_NAME || 'calculator');
    const user = await db.collection('user').findOne({ email });

    if (!user) {
        console.error(`Пользователь с email ${email} не найден.`);
        process.exit(1);
    }

    const hash = await bcryptjs.hash(newPassword, 10);
    const now = new Date();

    await db.collection('account').updateOne(
        { userId: user._id, providerId: 'credential' },
        {
            $set: { password: hash, updatedAt: now },
            $setOnInsert: {
                userId: user._id,
                accountId: user._id.toString(),
                providerId: 'credential',
                createdAt: now,
            },
        },
        { upsert: true },
    );

    // Сбрасываем активные сессии пользователя.
    await db.collection('session').deleteMany({ userId: user._id });

    console.log(`Пароль для ${email} обновлён, активные сессии сброшены.`);
} finally {
    await client.close();
}
