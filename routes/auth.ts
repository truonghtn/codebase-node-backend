import * as express from 'express';
import * as moment from 'moment';

import * as C from '../glob/cf';
import HC from '../glob/hc';
import ERR from '../glob/err';
import * as CONN from '../glob/conn';
import _ from '../utils/_';
import { ajv2 } from '../utils/ajv2';

// Import models here

// Import services here
import AuthServ from '../serv/auth';
import { User } from '../models/index';
import { ObjectID } from 'mongodb';
import { UserServ } from '../serv/user';
import { JWTAuth } from '../utils/auth';
import { ENV } from '../glob/env';

const router = express.Router();
const _ajv = ajv2();

// Start API here
let bodyValidator = _ajv({
    '+@phone': 'string',
    '+@password': 'string',
    '@ext': 'string',
    '++': false
});
router.post('/login', _.validBody(bodyValidator), _.routeAsync(async (req) => {
    const phone: string = req.body.phone;
    const password: string = req.body.password;

    const user = await User.findOne({ phone: phone }, { fields: ['_id', 'roles'] });

    const isPasswordCorrect = user && await UserServ.isValidPassword(user._id, password)
    if (!isPasswordCorrect) {
        throw _.logicError('Cannot login', 'Invalid username or password', 400, ERR.INVALID_USERNAME_OR_PASSWORD);
    }

    const token = AuthServ.jwtAuth.genTokens({
        id: user._id.toHexString()
    });
    return token;
}));

const issueNewTokenBody = _ajv({
    '+@refresh_token': 'string',
    '@ext': 'string'
});
router.post('/token', _.validBody(issueNewTokenBody), _.routeAsync(async (req) => {
    const refreshToken = req.body.refresh_token;
    const expires = new Date().valueOf() / 1000 + AuthServ.jwtAuth.accessTokenExpires;
    const accessToken = AuthServ.jwtAuth.genAccessToken(refreshToken);

    const tokens = {
        access_token: accessToken,
        expires_in: expires,
        refresh_token: refreshToken,
        token_type: 'bearer'
    }

    return tokens;
}));

const logoutBody = _ajv({
    '+@access_token': 'string',
    '+@refresh_token': 'string',
    '++': false
});
router.put('/logout', _.routeAsync(async req => {
    // : Handle invalidate token logic
    const accessToken: string = req.body.access_token;
    const auth = AuthServ.jwtAuth.getUser(accessToken);
    await User.updateOne({ _id: _.mObjId(auth.id as string) }, { $set: { ext: null } });

    return HC.SUCCESS;
}));

export default router;