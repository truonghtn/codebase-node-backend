import * as moment from 'moment';

import CONN from '../glob/conn';
import _ from '../utils/_';

import { IMongoModel, ObjectID } from './mongo-model';
import { USER_ROLE } from '../glob/cf';

export interface IUser extends IMongoModel {
    fullName: string;
    birthDay: number;

    phone: string;
    email: string;
    avatar?: string;

    ext?: string;

    roles: USER_ROLE[];
}