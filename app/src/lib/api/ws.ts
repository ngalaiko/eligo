import io from 'socket.io-client';
import { dev } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { deleteDB, openDB } from 'idb';
import {
	type User,
	emptyState,
	reduce,
	lists,
	users,
	picks,
	items,
	boosts,
	memberships
} from '@eligo/protocol';

export const state = writable(emptyState);

const socket = io({
	withCredentials: true,
	autoConnect: false
});

export const connected = writable(true);

// debug logs for development
if (dev) {
	socket.onAny((event, ...args) => console.debug(event, args));
	socket.on('disconnect', () => console.debug('disconnected'));
	socket.on('connect', () => console.debug('connected'));
}

const eventTypes = [
	lists.create.type,
	lists.update.type,
	lists.delete.type,

	users.create.type,
	users.update.type,
	users.delete.type,

	picks.create.type,
	picks.update.type,
	picks.delete.type,

	items.create.type,
	items.update.type,
	items.delete.type,

	boosts.create.type,
	boosts.update.type,
	boosts.delete.type,

	memberships.create.type,
	memberships.update.type,
	memberships.delete.type
];

socket.on('connect', () => connected.set(socket.connected));
socket.on('disconnect', () => connected.set(socket.connected));
socket.on('connect_error', () => connected.set(socket.connected));

export const connect = async (user: User) => {
	deleteDB('eligo');
	deleteDB('eligo.2');
	const db = await openDB(`eligo.${user.id}`, 1, {
		upgrade: (db) => {
			db.createObjectStore('state');
		}
	});
	socket.on('disconnect', () => db.close());

	// init state
	await db
		.getAll('state')
		.then((actions) => actions.reduce(reduce, emptyState))
		.then(state.set);

	const keys = await db.getAllKeys('state');
	const lastSynched = keys.reduce((max, key) => (key > max ? key : max), 0);

	socket.auth = {
		...socket.auth,
		userId: user.id,
		lastSynched
	};

	eventTypes.forEach((eventType) => {
		// subscribe to all events
		eventTypes.forEach((eventType) =>
			socket.on(eventType, (action) =>
				state.update((state) => reduce(state, { type: eventType, payload: action }))
			)
		);

		// save all new events to the store
		socket.on(eventType, (action) => {
			const ts = action.deleteTime ?? action.updateTime ?? action.createTime;
			db.put('state', { type: eventType, payload: action }, ts);
			socket.auth = { ...socket.auth, lastSynched: ts };
		});
	});

	socket.connect();
};

export default {
	boosts: {
		list: derived(state, (state) => Object.values(state.boosts))
	},
	items: {
		list: derived(state, (state) => Object.values(state.items))
	},
	lists: {
		list: derived(state, (state) => Object.values(state.lists))
	},
	memberships: {
		list: derived(state, (state) => Object.values(state.memberships))
	},
	picks: {
		list: derived(state, (state) => Object.values(state.picks))
	},
	users: {
		list: derived(state, (state) => Object.values(state.users))
	}
};
