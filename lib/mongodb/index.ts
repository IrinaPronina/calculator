import { MongoClient } from 'mongodb';

const clientPromise = MongoClient.connect(process.env.DB_URL as string, {
    maxPoolSize: 10,
});

export default clientPromise;
