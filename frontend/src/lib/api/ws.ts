import io from 'socket.io-client';
import { wsHost } from './http';
import { dev } from '$app/environment';
import { writable, derived } from 'svelte/store';
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

(async () => {
    socket.connect();
})();

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

socket.on('auth', (user: User) => {
    actions.set([]);
    auth.set({ user });
});

auth.subscribe(({ user }) => {
    if (user) window.localStorage.setItem('user.id', user.id);
    if (!user) window.localStorage.removeItem('user.id');
});

auth.subscribe(({ user }) => {
    if (user && socket.disconnected) socket.connect();
    if (!user && socket.connected) socket.disconnect();
});

// debug logs
if (dev) socket.onAny((event, ...args) => console.debug(event, args));

// subscribe to events
[
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
].forEach((eventType) =>
    socket.on(eventType, (action) =>
        actions.update((log) => [...log, { type: eventType, payload: action }])
    )
);
