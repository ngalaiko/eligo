import type { Handle } from '@sveltejs/kit';
import { signer, verifier, openDatabase } from '@eligo/server';
import { building, dev } from '$app/environment';

let database = building
    ? undefined
    : openDatabase(dev ? 'database.dev.jsonl' : '/data/database.jsonl');

let tokens = building
    ? undefined
    : signer(database!).then((signer) => ({ ...signer, ...verifier(database!) }));

export const handle: Handle = async ({ event, resolve }) => {
    if (!building) {
        event.locals.database = database!;
        event.locals.tokens = await tokens!;
    }

    return await resolve(event);
};
