import * as moment from 'moment';
import * as schedule from 'node-schedule';

export interface IJob {
    scheduleJob?: schedule.Job;
    rule: string;
    doJob(time: moment.Moment): Promise<void>
}

export class JobServ {
    jobs: IJob[] = [];
    
    start() {
        for (const job of this.jobs) {
            job.scheduleJob = schedule.scheduleJob(job.rule, () => {
                job.doJob(moment());
            })
        }
    }
}

export const JobManager = new JobServ();