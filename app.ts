import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as moment from 'moment';

import { ENV } from './glob/env';
import CONN from './glob/conn';
import HC from './glob/hc';
import _ from './utils/_';

import * as MODELS from './models';

import SessionServ from './serv/sess';

// Import routers
import LoginRoute from './routes/auth';

import { AuthServ } from './serv/auth';
import { UserServ } from './serv/user';
import { JobManager } from './serv/job/job';
import { ExpiringNameJob } from './serv/job/expiring_name_job';

class Program {
    public static async main(): Promise<number> {
        await CONN.configureConnections(ENV.DB);

        MODELS.init(CONN.MONGO);

        AuthServ.MODEL = UserServ

        const server = express();
        server.use(bodyParser.json());

        // create session object
        server.use(SessionServ());

        // CORS
        server.all('*', function (req, res, next) {
            res.header('Access-Control-Allow-Origin', "*");
            res.header('Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, DELETE');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Max-Age', '86400');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, ' +
                'Content-Type, Accept, Authentication, Authorization, X-Consumer-Username, sess');

            if (req.method.toUpperCase() == 'OPTIONS') {
                res.statusCode = 204;
                res.send();
                return;
            }

            next();
        });

        // Configure routes
        server.use('/auth', LoginRoute);

        // Start server
        server.listen(ENV.HTTP_PORT, function () {
            console.log("Listen on port " + ENV.HTTP_PORT + " ...");
        });

        JobManager.jobs.push(new ExpiringNameJob());
        JobManager.start();

        return 0;
    }
}

Program.main();