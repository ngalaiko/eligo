import { actionCreatorFactory } from './vendor/typescript-fsa/index.js';
import { reducerWithInitialState } from './vendor/typescript-fsa-reducers/index.js';

import {
	User,
	List,
	Pick,
	Boost,
	Item,
	Membership,
	WebPushSubscription,
	JWTPublicKey
} from '@eligo/protocol';

const crud = <T extends { id: string }>(name: string) => {
	const creator = actionCreatorFactory(name);
	const actions = {
		create: creator<T>('create'),
		created: creator<T>('created'),
		update: creator<{ id: string } & Partial<Omit<T, 'id'>>>('update'),
		updated: creator<{ id: string } & Partial<Omit<T, 'id'>>>('updated'),
		delete: creator<{ id: string }>('delete'),
		deleted: creator<{ id: string }>('deleted')
	};
	const reducer = reducerWithInitialState({} as Record<string, T>)
		.cases([actions.create, actions.created], (state, payload) => ({
			...state,
			[payload.id]: payload
		}))
		.cases([actions.update, actions.updated], (state, payload) => ({
			...state,
			[payload.id]: { ...state[payload.id], ...payload }
		}))
		.cases([actions.delete, actions.deleted], (state, payload) => {
			delete state[payload.id];
			return state;
		});
	return { ...actions, reducer };
};

export const jwtKeys = crud<JWTPublicKey>('jwt-public-keys');
export const users = crud<User>('users');
export const lists = crud<List>('lists');
export const memberships = crud<Membership>('memberships');
export const items = crud<Item>('items');
export const picks = crud<Pick>('picks');
export const boosts = crud<Boost>('boosts');
export const webPushSuscriptions = crud<WebPushSubscription>('web-push-subscriptions');

export type Action =
	| ReturnType<typeof jwtKeys[keyof Omit<typeof jwtKeys, 'reducer'>]>
	| ReturnType<typeof users[keyof Omit<typeof users, 'reducer'>]>
	| ReturnType<typeof lists[keyof Omit<typeof lists, 'reducer'>]>
	| ReturnType<typeof memberships[keyof Omit<typeof memberships, 'reducer'>]>
	| ReturnType<typeof items[keyof Omit<typeof items, 'reducer'>]>
	| ReturnType<typeof picks[keyof Omit<typeof picks, 'reducer'>]>
	| ReturnType<typeof boosts[keyof Omit<typeof boosts, 'reducer'>]>
	| ReturnType<typeof webPushSuscriptions[keyof Omit<typeof webPushSuscriptions, 'reducer'>]>;
