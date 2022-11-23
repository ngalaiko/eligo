import { users } from '@eligo/state';
import type { Server, Socket } from 'socket.io';
import type { Database } from '../db.js';
import { errNotFound, validate } from '../validation.js';

export default (io: Server, socket: Socket, database: Database) => {
    socket.on(
        users.update.type,
        async (
            req: Partial<{ displayName: string; id: string; updateTime: EpochTimeStamp }>,
            callback
        ) => {
            const validationErr = validate(req, {
                id: socket.data.userId,
                updateTime: 'required'
            });
            if (validationErr) {
                callback(validationErr);
                return;
            }

            const user = await database.find('users', { id: socket.data.userId });
            if (!user) {
                callback(errNotFound('user not found'));
                return;
            }

            const patch = { displayName: req.displayName, updateTime: req.updateTime! };

            if (user === { ...patch, ...user }) {
                callback(null);
                return;
            }

            await database.append(socket.data.userId, users.update({ id: user.id, ...patch }));

            const updated = users.updated({ id: user.id, ...patch });
            io.to(user.id).emit(updated.type, updated.payload);

            callback(null);
        }
    );
};
