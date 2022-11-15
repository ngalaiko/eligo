import yargs from 'yargs';

const argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 [options]')
    .option('database', {
        alias: 'd',
        describe: 'Database path',
        default: './database.dev.jsonl'
    })
    .option('port', {
        alias: 'p',
        describe: 'Port to listen on',
        default: 31337
    })
    .option('host', {
        alias: 'h',
        describe: 'Host to listen on',
        default: 'localhost'
    })
    .option('vapid-public-key', {
        describe: 'Public VAPID key to send WebPush notifications',
        default:
            'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
    })
    .option('vapid-private-key-path', {
        describe: 'Path to a file with VALID private key to send WebPush notifications',
        default: './vapid-private-key.txt'
    })
    .parseSync();

import { createServer } from 'http';
import { createServer as httpsCreateServer } from 'https';
import openDatabase from './db.js';
import createNotifications from './notifications.js';
import setupTokens from './tokens.js';
import setupHttp from './http/index.js';
import setupWs from './ws/index.js';
import polka from 'polka';
import cors from 'cors';
import corsOptions from './cors.js';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import { dirname } from 'path';

const database = openDatabase(argv.database);
const tokens = await setupTokens(database);
const notifications = createNotifications(
    {
        subject: 'mailto:nikita@galaiko.rocks',
        privateKey: readFileSync(argv.vapidPrivateKeyPath).toString().trim(),
        publicKey: argv.vapidPublicKey
    },
    database
);

const isDevelopment = process.env.NODE_ENV === 'development';

const pwd = dirname(process.argv[1]);

const server = isDevelopment
    ? httpsCreateServer({
        cert: readFileSync(`${pwd}/../.cert/localhost.pem`),
        key: readFileSync(`${pwd}/../.cert/localhost-key.pem`)
    })
    : createServer();

const app = polka({ server })
    .use(cors(corsOptions))
    .listen(argv.port, argv.host, () =>
        console.log(`listening on ${isDevelopment ? 'https' : 'http'}://${argv.host}:${argv.port}`)
    );

const io = new Server(server, { cors: corsOptions });

setupHttp(app, database, tokens, io, notifications);
setupWs(io, database, tokens, notifications);
