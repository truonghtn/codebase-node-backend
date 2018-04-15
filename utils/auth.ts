import * as jwt from 'jsonwebtoken';
import { debug } from 'util';

export interface IAuth {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: string;
}

export interface IAuthUser {
    id: number | string;
}

export class JWTAuth {
    readonly secrect: string;
    readonly accessTokenExpires: number;
    readonly refreshTokenExpires: number;

    constructor(secrect: string, accessTokenExpires: number, refreshTokenExpires: number) {
        this.secrect = secrect;
        this.accessTokenExpires = accessTokenExpires;
        this.refreshTokenExpires = refreshTokenExpires;
    }

    genTokens(user: IAuthUser) {
        const refreshToken = this.genRefreshToken(user);
        const now = new Date();
        const accessToken = this.genAccessToken(refreshToken);
        const accessTokenExpiresIn = (now.valueOf() / 1000) + this.accessTokenExpires;
        return <IAuth> {
            access_token: accessToken,
            expires_in: accessTokenExpiresIn,
            refresh_token: refreshToken,
            token_type: 'bearer'
        }
    }

    genRefreshToken(user: IAuthUser) {
        const refreshToken = jwt.sign(<any> {
            id: user.id,
            type: 'REFRESH'
        }, this.secrect, {expiresIn: this.refreshTokenExpires});
        return refreshToken;
    }

    genAccessToken(refreshToken: string) {
        const tokenData: any = jwt.verify(refreshToken, this.secrect);
        if (tokenData.type == 'REFRESH') {
            return jwt.sign(<any> {
                id: tokenData.id,
                type: 'ACCESS'
            }, this.secrect, {expiresIn: this.accessTokenExpires})
        }

        return null;
    }

    getUser(accessToken: string): IAuthUser {
        const tokenData: any = jwt.verify(accessToken, this.secrect);
        if (tokenData.type == 'ACCESS') {
            return {
                id: tokenData.id
            }
        }

        throw new Error(`Invalid access token`);
    }
}