import { webPushSuscriptions } from '@eligo/state';
import type { Server, Socket } from 'socket.io';
import type { Database } from '../db.js';

export default (io: Server, socket: Socket, database: Database) => {
    socket.on(
        webPushSuscriptions.create.type,
        async (req: ReturnType<typeof webPushSuscriptions.create>['payload'], callback) => {
            await database.append(socket.data.userId, webPushSuscriptions.create(req));
            const created = webPushSuscriptions.created(req);

            socket.join(created.payload.id);
            io.to(created.payload.id).emit(created.type, created.payload);

            callback(null);
        }
    );

    socket.on(
        webPushSuscriptions.delete.type,
        async (req: ReturnType<typeof webPushSuscriptions.delete>['payload'], callback) => {
            await database.append(socket.data.userId, webPushSuscriptions.delete(req));
            const deleted = webPushSuscriptions.deleted(req);

            socket.join(deleted.payload.id);
            io.to(deleted.payload.id).emit(deleted.type, deleted.payload);

            callback(null);
        }
    );
};
