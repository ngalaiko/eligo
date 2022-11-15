import io from 'socket.io-client';
import { wsHost } from './http';
import { dev } from '$app/environment';
import { writable, derived, readable, type Readable } from 'svelte/store';
import { openDB } from 'idb';
import {
    type Action,
    emptyState,
    reduce,
    lists,
    users,
    picks,
    items,
    boosts,
    memberships,
    webPushSuscriptions
} from '@eligo/state';
import type { Error } from '@eligo/protocol';

const actions = writable([] as Action[]);
export const state = derived(actions, (actions) => actions.reduce(reduce, emptyState));

const socket = io(wsHost, {
    withCredentials: true,
    autoConnect: false,
    auth: {
        userId: window.localStorage.getItem('user.id')
    }
});

const connectedStore = writable(false);
export const connected = derived(connectedStore, (v) => v);

socket.on('connect', () => connectedStore.set(true));
socket.on('disconnect', () => connectedStore.set(false));

export const send = async (action: Action) =>
    new Promise<void>((resolve, reject) =>
        socket.emit(action.type, action.payload, (error: Error) => {
            if (error) {
                reject(new Error(error.message));
            } else {
                resolve();
            }
        })
    );

// auth

type User = { id: string; name: string };

export const auth = writable<{ user?: User }>({});

socket.on('auth', async (user: User) => {
    const db = await openDB('eligo', 1, {
        upgrade: (db) => db.createObjectStore(user.id)
    });

    // booststrap state from the local db
    const values = await db.getAll(user.id);
    actions.set(values);
    db.close();

    auth.set({ user });
});

auth.subscribe(({ user }) => {
    if (user) {
        if (socket.disconnected) socket.connect();
        window.localStorage.setItem('user.id', user.id);
    }
    if (!user && socket.connected) {
        socket.disconnect();
        window.localStorage.removeItem('user.id');
    }
});

// debug logs
if (dev) socket.onAny((event, ...args) => console.debug(event, args));

const eventTypes = [
    lists.created.type,
    lists.updated.type,
    lists.deleted.type,

    users.created.type,
    users.updated.type,
    users.deleted.type,

    picks.created.type,
    picks.updated.type,
    picks.deleted.type,

    items.created.type,
    items.updated.type,
    items.deleted.type,

    boosts.created.type,
    boosts.updated.type,
    boosts.deleted.type,

    memberships.created.type,
    memberships.updated.type,
    memberships.deleted.type,

    webPushSuscriptions.created.type,
    webPushSuscriptions.updated.type,
    webPushSuscriptions.deleted.type
];

// subscribe to events
eventTypes.forEach((eventType) =>
    socket.on(eventType, (action) =>
        actions.update((log) => [...log, { type: eventType, payload: action }])
    )
);

(async () => {
    const userId = window.localStorage.getItem('user.id');
    if (!userId) {
        socket.connect();
        return;
    }

    const db = await openDB('eligo', 1, {
        upgrade: (db) => db.createObjectStore(userId)
    });

    const keys = await db.getAllKeys(userId);
    const lastSynched = keys.reduce((max, key) => (key > max ? key : max), 0);

    // @ts-ignore
    // i am sure it's a map here
    socket.auth.lastSynched = lastSynched;

    // save all new events to the store
    eventTypes.forEach((eventType) => {
        socket.on(eventType, (action) => {
            db.put(
                userId,
                { type: eventType, payload: action },
                action.deleteTime ?? action.updateTime ?? action.createTime
            );
        });
    });

    socket.connect();
})();
