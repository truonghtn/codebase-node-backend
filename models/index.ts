import * as mongodb from 'mongodb';

import { IUser } from './user';
import { IUserAuth } from './user-auth';
import { ICustomer } from './customer';
import { IOrder } from './order';
import { IIncommingCall } from './incomming-call';
import { IProduct } from './product';
import { ICallData } from './call-data';
import { IAccountBalance } from './account-balance';
import { ITransaction } from './transaction';

export * from './user';
export * from './user-auth';

export let User: mongodb.Collection<IUser>;
export let UserAuth: mongodb.Collection<IUserAuth>;

export function init(db: mongodb.Db) {
    User = db.collection<IUser>('user');
    UserAuth = db.collection<IUserAuth>('user_auth');

    migrate(db);
}

const MIGRATIONS = [migrateV1, migrateV2];

async function migrate(db: mongodb.Db) {
    const dbConfig = await db.collection('config').findOne({ type: 'db' });
    const dbVersion = (dbConfig && dbConfig.version) || 0;
    for (let i = dbVersion; i < MIGRATIONS.length; ++i) {
        await MIGRATIONS[i]();
        await db.collection('config').updateOne({ type: 'db' }, { $set: { version: i + 1 } }, { upsert: true });
    }
}

async function migrateV1() {
    UserAuth.createIndex({ user: 'hashed' });
}

async function migrateV2() {
    User.createIndex({ ext: 1 });
}