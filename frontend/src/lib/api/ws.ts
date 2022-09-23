import io from 'socket.io-client';
import { wsHost } from './http';
import { dev } from '$app/environment';
import { writable, type Writable, type Readable } from 'svelte/store';
import {
	lists,
	reduce,
	emptyState,
	type Action,
	users,
	picks,
	items,
	boosts,
	memberships,
	webPushSuscriptions
} from '@eligo/state';
import type { Error } from '@eligo/protocol';

type User = { id: string; name: string };

const stateEvents = [
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

const toReadable = <T>(store: Writable<T>): Readable<T> => ({
	subscribe: store.subscribe
});

export const auth = writable<{ user?: User }>({});
const stateStore = writable(emptyState);
export const state = toReadable(stateStore);

const socket = io(wsHost, {
	withCredentials: true
});

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

if (dev) socket.onAny((event, ...args) => console.debug(event, args));

socket.on('auth', (user: User) => {
	stateStore.set(emptyState);
	auth.set({ user });
});

auth.subscribe(({ user }) => {
	if (user && socket.disconnected) socket.connect();
	if (!user && socket.connected) socket.disconnect();
});

stateEvents.forEach((eventType) =>
	socket.on(eventType, (action) =>
		stateStore.update((stateStore) => reduce(stateStore, { type: eventType, payload: action }))
	)
);
