import type { List } from '@eligo/protocol';
import polka from 'polka';
import type { Database } from '../db.js';
import { HTTPError } from './error.js';
import { Request } from './request.js';

export default (database: Database) => ({
    //
    // returns all lists available to the user
    //
    handler: polka().get('/', async (req: Request, res) => {
        try {
            if (req.userId === undefined) {
                res.setHeader('Content-Type', 'application/json');
                res.end('[]');
                return;
            }

            const notDeleted = <T extends { deleteTime?: number }>({ deleteTime }: T) =>
                deleteTime === undefined;

            const notNull = <T extends any>(obj: T | undefined) => obj !== undefined;

            const [ownerOfLists, memberOfListIds] = await Promise.all([
                database.filter('lists', { userId: req.userId }).then((lists) => lists.filter(notDeleted)),
                database
                    .filter('memberships', { userId: req.userId })
                    .then((memberships) => memberships.filter(notDeleted).map(({ listId }) => listId))
            ]);

            const memberOfLists = await Promise.all(
                memberOfListIds
                    .filter((id) => ownerOfLists.find((list) => list.id === id) === undefined)
                    .map((id) => database.find('lists', { id }))
            )
                .then((lists) => lists.filter(notNull) as List[])
                .then((lists) => lists.filter(notDeleted));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([...ownerOfLists, ...memberOfLists]));
        } catch (err) {
            if (err instanceof HTTPError) {
                res.statusCode = err.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(err.apiError));
            } else {
                console.error(err);
                res.statusCode = 500;
                res.end('Internal server error');
            }
        }
    })
});
