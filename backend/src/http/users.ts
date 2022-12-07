import polka from 'polka';
import { errEmpty, errInvalid, errNotFound, errRequired } from '../validation.js';
import { hash } from 'bcrypt';
import { users } from '@eligo/state';
import { nanoid } from 'nanoid';
import { serialize } from 'cookie';
import { addDays } from 'date-fns';
import { HTTPError } from './error.js';
import type { Database } from '../db.js';
import type { Tokens } from '../tokens.js';
import { authCookieName } from './auth.js';
import { Request } from './request.js';
import type { List, Membership, User } from '@eligo/protocol';

export default (database: Database, tokens: Tokens) => ({
    handler: polka()
        //
        // returns all users that logged-in user is allowed to see
        // these are:
        //   * the user itself
        //   * members of lists the user owns
        //   * members of lists the user is a member of
        //
        .get('/', async (req: Request, res) => {
            try {
                if (req.userId === undefined) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end('[]');
                    return;
                }

                const notDeleted = <T extends { deleteTime?: number }>({ deleteTime }: T) =>
                    deleteTime === undefined;

                const flatten = (arrayOfArrays: any[][]) => arrayOfArrays.flatMap((array) => array);

                const notNull = <T extends any>(obj: T | undefined) => obj !== undefined;

                const unique = <T extends any>(value: T, index: number, all: T[]) =>
                    all.indexOf(value) === index;

                const [ownerOfListIds, memberOfListIds] = await Promise.all([
                    database
                        .filter('lists', { userId: req.userId })
                        .then((lists) => lists.filter(notDeleted).map(({ id }) => id)),
                    database
                        .filter('memberships', { userId: req.userId })
                        .then((memberships) => memberships.filter(notDeleted).map(({ listId }) => listId))
                ]);

                const memberOfLists = await Promise.all(
                    memberOfListIds.map((id) => database.find('lists', { id }))
                )
                    .then((lists) => lists.filter(notNull) as List[])
                    .then((lists) => lists.filter(notDeleted));

                const membersOfRelatedLists = await Promise.all(
                    [...ownerOfListIds, ...memberOfListIds].map((listId) =>
                        database.filter('memberships', { listId })
                    )
                )
                    .then(flatten)
                    .then((memberships) => memberships.filter(notNull) as Membership[])
                    .then((memberships) => memberships.filter(notDeleted));

                const users = Promise.all(
                    [
                        ...membersOfRelatedLists.map(({ userId }) => userId),
                        ...memberOfLists.map(({ userId }) => userId)
                    ]
                        .filter(unique)
                        .map((id) => database.find('users', { id }))
                )
                    .then((users) => users.filter(notNull) as User[])
                    .then((users) => users.filter(notDeleted));

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify((await users).map((user) => ({ ...user, hash: undefined }))));
                return;
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
        //
        // creates a user
        //
        .post('/', async (req, res) => {
            try {
                const { name, password } = req.body;
                if (name === undefined) throw new HTTPError(400, errRequired(`'name' is required`));
                if (typeof name !== 'string')
                    throw new HTTPError(400, errInvalid(`'name' must be a string`));
                if (name.length === 0) throw new HTTPError(400, errEmpty(`'name' can not be empty`));
                if (password === undefined) throw new HTTPError(400, errRequired(`'pasword' is required`));
                if (typeof password !== 'string')
                    throw new HTTPError(400, errInvalid(`'password' must be a string`));
                if (password.length === 0)
                    throw new HTTPError(400, errEmpty(`'password' can not be empty`));

                const existing = await database.find('users', { name });
                if (existing) throw new HTTPError(409, errInvalid('User already exists'));

                const passwordHash = await hash(password, 10);

                const user = {
                    id: nanoid(),
                    name,
                    hash: passwordHash,
                    createTime: new Date().getTime()
                };
                await database.append(user.id, users.create(user));

                const token = await tokens.sign({ sub: user.id });
                const cookie = serialize(authCookieName, token, {
                    httpOnly: true,
                    expires: addDays(new Date(), 28)
                });

                res.setHeader('Set-Cookie', cookie);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ...user, hash: undefined }));
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
        //
        // updates a user
        //
        .patch('/:id', async (req: Request, res) => {
            try {
                if (!req.userId || req.userId !== req.params.id)
                    throw new HTTPError(404, errNotFound('Not found'));

                const { password } = req.body;

                if (password === undefined) throw new HTTPError(400, errRequired(`'pasword' is required`));
                if (typeof password !== 'string')
                    throw new HTTPError(400, errInvalid(`'password' must be a string`));
                if (password.length === 0)
                    throw new HTTPError(400, errEmpty(`'password' can not be empty`));

                const user = await database.find('users', { id: req.params.id });
                if (!user) throw new HTTPError(404, errNotFound('Not found'));

                await database.append(
                    user.id,
                    users.update({
                        id: user.id,
                        hash: await hash(password, 10),
                        updateTime: new Date().getTime()
                    })
                );

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ...user, hash: undefined }));
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
