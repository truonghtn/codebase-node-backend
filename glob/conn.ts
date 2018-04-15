import * as mongodb from 'mongodb';
import * as redis from 'redis';

import { RedisClient } from '../utils/redis-ts';
import _ from '../utils/_';

import { ENV_DB_CONFIG } from './env';


// ************ CONFIGS ************

export class AppConnections {
    private redis: RedisClient;
    private mongo: mongodb.Db;

    get REDIS() { return this.redis; }
    get MONGO() { return this.mongo }

    constructor() {

    }

    async configureConnections(dbConfig: ENV_DB_CONFIG) {
        const redisConn: redis.RedisClient = redis.createClient(dbConfig.REDIS);
        this.redis = new RedisClient(redisConn);
        
        this.mongo = await mongodb.connect(dbConfig.MONGO.CONNECTION_STRING, dbConfig.MONGO.OPTIONS);
    }
}

const CONN = new AppConnections();
export default CONN;

