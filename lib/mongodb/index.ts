import { MongoClient } from 'mongodb';

let promise: Promise<MongoClient> | undefined;

const getClientPromise = (): Promise<MongoClient> => {
    if (!promise) {
        const attempt = MongoClient.connect(process.env.DB_URL as string, {
            maxPoolSize: 10,
        });
        // При ошибке подключения сбрасываем кэш, чтобы следующий
        // запрос попробовал подключиться заново, а не получал
        // навсегда закэшированный rejected promise.
        attempt.catch(() => {
            if (promise === attempt) {
                promise = undefined;
            }
        });
        promise = attempt;
    }
    return promise;
};

// Ленивый thenable: подключение создаётся при первом await,
// а не при импорте модуля (иначе `next build` падает без DB_URL).
const clientPromise = {
    then: (onFulfilled?: any, onRejected?: any) =>
        getClientPromise().then(onFulfilled, onRejected),
    catch: (onRejected?: any) => getClientPromise().catch(onRejected),
    finally: (onFinally?: any) => getClientPromise().finally(onFinally),
    [Symbol.toStringTag]: 'Promise',
} as Promise<MongoClient>;

export default clientPromise;
