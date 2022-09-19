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

type User = { id: string; name: string };

const stateEvents = [
	lists.created.type,
	lists.updated.type,

	users.updated.type,

	picks.created.type,
	picks.updated.type,

	items.created.type,
	items.updated.type,

	boosts.created.type,
	boosts.updated.type,

	memberships.created.type,
	memberships.updated.type,

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

export const send = async (action: Action) => {
	socket.emit(action.type, action.payload, (error: any) => {
		if (error) throw new Error(error);
	});
};

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
