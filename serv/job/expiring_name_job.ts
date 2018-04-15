import _ from '../../utils/_';
import * as moment from 'moment';
import * as schedule from 'node-schedule';

import { IJob } from "./job";

export class ExpiringNameJob implements IJob {
    scheduleJob: schedule.Job

    get rule() {
        return '0 /5 * * * *'
    }

    async doJob(time: moment.Moment) {

    }
}