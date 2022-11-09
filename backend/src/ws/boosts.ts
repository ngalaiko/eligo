import { Boost } from '@eligo/protocol';
import { boosts } from '@eligo/state';
import type { Socket, Server } from 'socket.io';
import type { Database } from '../db.js';
import { Notifications } from '../notifications.js';
import { validate } from '../validation.js';

export default (io: Server, socket: Socket, database: Database, notifications: Notifications) => {
    socket.on(boosts.create.type, async (req: Partial<Boost>, callback) => {
        const validationErr = validate(req, {
            id: 'required',
            userId: socket.data.userId,
            listId: 'required',
            itemId: 'required',
            createTime: 'required'
        });
        if (validationErr) {
            callback(validationErr);
            return;
        }
        const boost = req as Boost;

        if (req.id) await database.append(socket.data.userId, boosts.create(boost));
        const created = boosts.created(boost);

        socket.join(created.payload.id);
        io.to([created.payload.id, created.payload.listId]).emit(created.type, created.payload);

        Promise.all([
            database.find('users', { id: boost.userId }),
            database.find('lists', { id: boost.listId }),
            database.find('items', { id: boost.itemId }),
            database.filter('memberships', { listId: boost.listId })
        ]).then(([user, list, item, memberships]) => {
            if (!list) return;
            if (!user) return;
            if (!item) return;

            const membersIds = memberships.map(({ userId }) => userId);
            const userIds = [...membersIds, list.userId].filter((userId) => userId !== boost.userId);
            new Set(userIds).forEach((userId) =>
                notifications.notify(userId, {
                    title: `New boost`,
                    options: {
                        body: `${user.name} boosted ${item.text} in ${list.title}`
                    }
                })
            );
        });

        callback(null);
    });
};
