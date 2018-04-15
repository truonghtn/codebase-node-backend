export interface ENV_DB_CONFIG {
    REDIS: any;
    MONGO: {
        CONNECTION_STRING: string;
        OPTIONS: any;
    }
}

export interface ENV_CONFIG {
    NAME: string;
    HTTP_PORT: number;
    DB: ENV_DB_CONFIG;
    AUTH: {
        SECRECT_KEY: string;
        ACCESS_TOKEN_EXPIRES: number;
        REFRESH_TOKEN_EXPIRES: number;
    }
}

export const ENV: ENV_CONFIG = require(process.env.config || '../env.json');
export default ENV;