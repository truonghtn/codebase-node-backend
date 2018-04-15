import * as moment from 'moment';

import CONN from '../glob/conn';
import _ from '../utils/_';

import { IMongoModel, ObjectID } from './mongo-model';
import { USER_ROLE } from '../glob/cf';

export interface IUserAuth extends IMongoModel {
    user: ObjectID;

    passwordSHA1: string;
    passwordSalt: string;
}