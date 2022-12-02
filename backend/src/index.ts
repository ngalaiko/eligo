import { createServer as createHttp } from 'http';
import { createServer as createHttps } from 'https';
import openDatabase from './db.js';
import Notifications, { noop } from './notifications.js';
import Tokens from './tokens.js';
import setupHttp from './http/index.js';
import setupWs from './ws/index.js';
import polka from 'polka';
import cors from 'cors';
import corsOptions from './cors.js';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import { dirname } from 'path';
import { argv } from './cmd.js';

const database = openDatabase(argv.database);
const tokens = await Tokens(database);

const isDevelopment = process.env.NODE_ENV === 'development';

const pwd = dirname(process.argv[1]);

const server = isDevelopment
    ? createHttps({
        cert: readFileSync(`${pwd}/../.cert/localhost.pem`),
        key: readFileSync(`${pwd}/../.cert/localhost-key.pem`)
    })
    : createHttp();

const app = polka({ server })
    .use(cors(corsOptions))
    .listen(argv.port, argv.host, () =>
        console.log(`listening on ${isDevelopment ? 'https' : 'http'}://${argv.host}:${argv.port}`)
    );

const io = new Server(server, { cors: corsOptions });

const notifications = argv.vapidPublicKey
    ? Notifications(
        {
            subject: 'mailto:nikita@galaiko.rocks',
            privateKey: readFileSync(argv.vapidPrivateKeyPath).toString().trim(),
            publicKey: argv.vapidPublicKey
        },
        database,
        io
    )
    : noop;

setupHttp(app, database, tokens, io, notifications);
setupWs(io, database, tokens, notifications);
