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

const c_ud = <
	T extends {
		id: string;
		createTime: EpochTimeStamp;
		updateTime?: EpochTimeStamp;
		deleteTime?: EpochTimeStamp;
	}
>(
	name: string
) => {
	const creator = actionCreatorFactory(name);
	const actions = {
		create: creator<T>('create'),
		created: creator<T>('created'),
		update: creator<
			{ id: string; updateTime: EpochTimeStamp } & Partial<Omit<T, 'id' | 'updateTime'>>
		>('update'),
		updated: creator<
			{ id: string; updateTime: EpochTimeStamp } & Partial<Omit<T, 'id' | 'updateTime'>>
		>('updated'),
		delete: creator<{ id: string; deleteTime: EpochTimeStamp } & Omit<T, 'deleteTime'>>('delete'),
		deleted: creator<{ id: string; deleteTime: EpochTimeStamp } & Omit<T, 'deleteTime'>>('deleted')
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
		.cases([actions.delete, actions.deleted], (state, payload) => ({
			...state,
			[payload.id]: { ...state[payload.id], ...payload }
		}));
	return { ...actions, reducer };
};

export const jwtKeys = c_ud<JWTPublicKey>('jwt-public-keys');
export const users = c_ud<User>('users');
export const lists = c_ud<List>('lists');
export const memberships = c_ud<Membership>('memberships');
export const items = c_ud<Item>('items');
export const picks = c_ud<Pick>('picks');
export const boosts = c_ud<Boost>('boosts');
export const webPushSuscriptions = c_ud<WebPushSubscription>('web-push-subscriptions');

export type Action =
	| ReturnType<typeof jwtKeys[keyof Omit<typeof jwtKeys, 'reducer'>]>
	| ReturnType<typeof users[keyof Omit<typeof users, 'reducer'>]>
	| ReturnType<typeof lists[keyof Omit<typeof lists, 'reducer'>]>
	| ReturnType<typeof memberships[keyof Omit<typeof memberships, 'reducer'>]>
	| ReturnType<typeof items[keyof Omit<typeof items, 'reducer'>]>
	| ReturnType<typeof picks[keyof Omit<typeof picks, 'reducer'>]>
	| ReturnType<typeof boosts[keyof Omit<typeof boosts, 'reducer'>]>
	| ReturnType<typeof webPushSuscriptions[keyof Omit<typeof webPushSuscriptions, 'reducer'>]>;
