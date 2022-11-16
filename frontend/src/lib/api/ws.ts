import io from 'socket.io-client';
import { wsHost } from './http';
import { browser, dev } from '$app/environment';
import { writable, derived, get } from 'svelte/store';
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
        userId: browser ? window.localStorage.getItem('user.id') : null
    }
});

const connectedStore = writable(true);
export const connected = derived(connectedStore, (v) => v);

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

// debug logs for development
if (dev) {
    socket.onAny((event, ...args) => console.debug(event, args));
    socket.on('disconnect', () => console.debug('disconnected'));
    socket.on('connect', () => console.debug('connected'));
}

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

// subscribe to all events
eventTypes.forEach((eventType) =>
    socket.on(eventType, (action) =>
        actions.update((log) => [...log, { type: eventType, payload: action }])
    )
);

type User = { id: string; name: string };

const getUserFromLocalStorage = () => {
    if (!browser) return undefined;
    const id = window.localStorage.getItem('user.id');
    const name = window.localStorage.getItem('user.name');
    return !!id && !!name ? { id, name } : undefined;
};

const saveUserToLocalStorage = (user: User) => {
    window.localStorage.setItem('user.id', user.id);
    window.localStorage.setItem('user.name', user.name);
};

const deleteUserFromLocalStorage = () => {
    if (!browser) return;
    window.localStorage.removeItem('user.id');
    window.localStorage.removeItem('user.name');
};

export const auth = writable<{ user?: User }>({
    user: getUserFromLocalStorage()
});

auth.subscribe(({ user }) => {
    if (user) {
        // keep user in the local storage
        saveUserToLocalStorage(user);
    } else {
        // cleanup user from the local storage if disconnected
        if (socket.connected) socket.disconnect();
        deleteUserFromLocalStorage();
    }
});

auth.subscribe(async ({ user }) => {
    if (!user) return;

    // boststrap state from the local db
    const db = await openDB('eligo', 1, {
        upgrade: (db) => db.createObjectStore(user.id)
    });
    actions.set(await db.getAll(user.id));
    db.close();
});

socket.on('connect', () => connectedStore.set(socket.connected));
socket.on('disconnect', () => connectedStore.set(socket.connected));
socket.on('connect_error', () => connectedStore.set(socket.connected));
socket.on('connect_error', () => auth.set({}));
socket.once('auth', () => connectedStore.set(socket.connected));

export const connect = async () => {
    const user = get(auth).user;
    const isAuthenticated = !!user;
    if (!isAuthenticated) {
        socket.once('auth', async (user: User) => auth.set({ user }));
        socket.connect();
    } else {
        const db = await openDB('eligo', 1, {
            upgrade: (db) => db.createObjectStore(user.id)
        });
        socket.on('disconnect', () => db.close());

        const keys = await db.getAllKeys(user.id);
        const lastSynched = keys.reduce((max, key) => (key > max ? key : max), 0);

        socket.auth = {
            ...socket.auth,
            lastSynched
        };

        // save all new events to the store
        eventTypes.forEach((eventType) => {
            socket.on(eventType, (action) => {
                db.put(
                    user.id,
                    { type: eventType, payload: action },
                    action.deleteTime ?? action.updateTime ?? action.createTime
                );
            });
        });

        socket.connect();
    }
};

connect();
