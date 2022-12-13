import { type Action, reduce, emptyState } from '@eligo/state';
import type {
    Item,
    JWTPublicKey,
    List,
    Membership,
    User,
    Pick,
    Boost,
    WebPushSubscription
} from '@eligo/protocol';
import { readFileSync, writeFileSync } from 'node:fs';
import { Tail } from 'tail';

const readFullData = (filepath: string): Action[] => {
    try {
        return readFileSync(filepath)
            .toString()
            .split('\n')
            .filter((l) => l.length > 0)
            .map((line) => JSON.parse(line));
    } catch (err: any) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
};

// reader watches all actions from _filepath_ happened after _from_
const reader = (filepath: string, from: number) => {
    let callbacks: ((action: Action) => void)[] = [];
    const tail = new Tail(filepath);

    let lastSeen = from;

    tail.on('line', (line: string) => {
        const action = JSON.parse(line) as Action;
        if (action.meta?.timestamp > lastSeen) {
            callbacks.forEach((callback) => callback(action));
            lastSeen = action.meta?.timestamp;
        }
    });

    return {
        on: (callback: (action: Action) => void) => {
            callbacks.push(callback);
        },
        off: (callback: (action: Action) => void) => {
            callbacks = callbacks.filter((cb) => cb !== callback);
        }
    };
};

export type Database = {
    on: (callback: (action: Action) => void) => void;
    off: (callback: (action: Action) => void) => void;

    append: (userId: string | undefined, action: Action) => Promise<void>;

    find: {
        (key: 'jwtKeys', filter: Partial<JWTPublicKey>): Promise<JWTPublicKey | undefined>;
        (key: 'users', filter: Partial<User>): Promise<User | undefined>;
        (key: 'lists', filter: Partial<List>): Promise<List | undefined>;
        (key: 'memberships', filter: Partial<Membership>): Promise<Membership | undefined>;
        (key: 'items', filter: Partial<Item>): Promise<Item | undefined>;
        (key: 'picks', filter: Partial<Pick>): Promise<Pick | undefined>;
        (key: 'boosts', filter: Partial<Boost>): Promise<Boost | undefined>;
        (key: 'webPushSuscriptions', filter: Partial<WebPushSubscription>): Promise<
            WebPushSubscription | undefined
        >;
    };
    filter: {
        (key: 'jwtKeys', filter: Partial<Omit<JWTPublicKey, 'id'>>): Promise<JWTPublicKey[]>;
        (key: 'users', filter: Partial<Omit<User, 'id'>>): Promise<User[]>;
        (key: 'lists', filter: Partial<Omit<List, 'id'>>): Promise<List[]>;
        (key: 'memberships', filter: Partial<Omit<Membership, 'id'>>): Promise<Membership[]>;
        (key: 'items', filter: Partial<Omit<Item, 'id'>>): Promise<Item[]>;
        (key: 'picks', filter: Partial<Omit<Pick, 'id'>>): Promise<Pick[]>;
        (key: 'boosts', filter: Partial<Omit<Boost, 'id'>>): Promise<Boost[]>;
        (key: 'webPushSuscriptions', filter: Partial<Omit<WebPushSubscription, 'id'>>): Promise<
            WebPushSubscription[]
        >;
    };
};

export default (filepath: string): Database => {
    console.log(`using database ${filepath}`);
    const data = readFullData(filepath);
    const stream = reader(filepath, Math.max(...data.map((d) => d.meta?.timestamp as number)));
    let state = data.reduce(reduce, emptyState);
    stream.on((action: Action) => (state = reduce(state, action)));
    return {
        on: stream.on,
        off: stream.off,

        append: async (userId: string | undefined, action: Action) => {
            action.meta ||= { userId, timestamp: new Date().getTime() };
            writeFileSync(filepath, JSON.stringify(action) + '\n', { flag: 'a' });
        },

        find: async <K extends keyof typeof state>(
            key: K,
            filter: Partial<typeof state[K][keyof typeof state[K]]>
        ): Promise<typeof state[K][keyof typeof state[K]] | undefined> => {
            if (Object.keys(filter).length === 1 && filter.id !== undefined) return state[key][filter.id];
            return Object.values(state[key]).find((value: any) =>
                Object.entries(filter).every(([k, v]) => value[k] === v)
            );
        },

        filter: async <K extends keyof typeof state>(
            key: K,
            filter: Partial<Omit<typeof state[K][keyof typeof state[K]], 'id'>> = {}
        ): Promise<typeof state[K][keyof typeof state[K]][]> => {
            return Object.values(state[key]).filter((value: any) =>
                Object.entries(filter).every(([k, v]) => value[k] === v)
            );
        }
    };
};
