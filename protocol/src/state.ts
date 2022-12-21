import { reducerWithInitialState } from './vendor/typescript-fsa-reducers/index.js';
import {
	jwtKeys,
	users,
	lists,
	memberships,
	items,
	picks,
	boosts,
	webPushSuscriptions,
	type Action
} from './actions.js';
import type {
	Boost,
	Item,
	JWTPublicKey,
	List,
	Pick,
	Membership,
	User,
	WebPushSubscription
} from './types';

export const emptyState = {
	jwtKeys: {} as Record<string, JWTPublicKey>,
	users: {} as Record<string, User>,
	lists: {} as Record<string, List>,
	memberships: {} as Record<string, Membership>,
	items: {} as Record<string, Item>,
	picks: {} as Record<string, Pick>,
	boosts: {} as Record<string, Boost>,
	webPushSuscriptions: {} as Record<string, WebPushSubscription>
};

export const reduce = reducerWithInitialState(emptyState).default((state, action) => ({
	...state,
	jwtKeys: jwtKeys.reducer(state.jwtKeys, action),
	users: users.reducer(state.users, action),
	lists: lists.reducer(state.lists, action),
	memberships: memberships.reducer(state.memberships, action),
	items: items.reducer(state.items, action),
	picks: picks.reducer(state.picks, action),
	boosts: boosts.reducer(state.boosts, action),
	webPushSuscriptions: webPushSuscriptions.reducer(state.webPushSuscriptions, action)
})) as (state: typeof emptyState, action: Action) => typeof emptyState;
