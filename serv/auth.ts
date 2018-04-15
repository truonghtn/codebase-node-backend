import * as express from 'express';
import { ObjectID } from 'mongodb';

import _ from '../utils/_';
import ERR from '../glob/err';
import { JWTAuth, IAuthUser } from '../utils/auth';
import { HC } from '../glob/hc';
import { ENV } from '../glob/env';
import { USER_ROLE } from '../glob/cf';

import { IUser } from '../models';

const SystemKeys = [
    {
        apikey: 'Zsp1IB65ESYHnofBZYmqrHhyf6l61FCX',
        system: 'VOICE_CLOUD'
    }
]

export interface IAuthUserModel {
    getUser(uid: string): Promise<IUser>;
}

export class AuthServ {
    static readonly jwtAuth = new JWTAuth(ENV.AUTH.SECRECT_KEY, ENV.AUTH.ACCESS_TOKEN_EXPIRES, ENV.AUTH.REFRESH_TOKEN_EXPIRES);
    static MODEL: IAuthUserModel;

    static authRole(...roles: USER_ROLE[]) {
        return _.routeNextableAsync(async (req, resp, next) => {
            const accessToken = req.header('Authorization');
            if (_.isEmpty(accessToken)) {
                throw _.logicError(`Unauthorized`, 'Invalid access token', 403, ERR.UNAUTHORIZED);
            }
            
            let authUser: IAuthUser = null;
            try {
                authUser = this.jwtAuth.getUser(accessToken);
            }
            catch (err) {
                throw _.logicError(`Unauthorized`, `${err}`, 403, ERR.UNAUTHORIZED);
            }

            const user = await this.MODEL.getUser(authUser.id as string);
            if (_.isEmpty(user)) {
                throw _.logicError('Unauthorized', `Invalid user`, 403, ERR.INVALID_ROLE);
            }

            if (!user.roles.find(r => roles.find(rr => rr == r) != null) == null) {
                throw _.logicError('Unauthorized', 'Invalid role', 403, ERR.INVALID_ROLE);
            }

            req.session.user = user;
            next();
        });
    }

    static AuthAPIKeySystem(...allowedSystems: string[]) {
        return _.routeNextableAsync(async (req, resp, next) => {
            const apiKey = req.header('apikey') || req.query.apikey || (req.body && req.body.apikey);
            if (_.isEmpty(apiKey)) {
                throw _.logicError(`Unauthorized`, 'APIKey not found', 403, ERR.UNAUTHORIZED);
            }
            
            const system = SystemKeys.find(sk => sk.apikey = apiKey);
            if (!system) {
                throw _.logicError(`Unauthorized`, 'Invalid APIKey', 403, ERR.UNAUTHORIZED);
            }

            if (allowedSystems.find(s => s == system.system) == null) {
                throw _.logicError(`Unauthorized`, 'Invalid APIKey', 403, ERR.UNAUTHORIZED);
            }

            req.session.system = system.system;
            next();
        });
    }
}

export default AuthServ;