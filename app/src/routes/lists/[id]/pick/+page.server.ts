import { nanoid } from 'nanoid';
import type { Actions, PageServerLoad } from './$types';
import { getWeights, type Item, type Pick, type Boost } from '@eligo/protocol';
import randomGenerator from '$lib/server/random';
import Api from '$lib/server/api';
import { error } from '@sveltejs/kit';
import { picks } from '@eligo/state';

const generator = randomGenerator();

const weightedRandom = (weights: number[]) => {
	const sum = weights.reduce((a, b) => a + b, 0);
	const r = generator.next() * sum;
	let acc = 0;
	for (let i = 0; i < weights.length; i++) {
		acc += weights[i];
		if (r < acc) {
			return i;
		}
	}
	return weights.length - 1;
};

const pickNext = (items: Item[], picks: Pick[], boosts: Boost[]) => {
	if (items.length === 0) return undefined;
	const itemIds = items.map((item) => item.id);
	const weightByItemId = getWeights(items, picks, boosts);
	const weights = itemIds.map((itemId) => weightByItemId[itemId]);
	return items[weightedRandom(weights)];
};

export const actions: Actions = {
	default: async ({ params, cookies, locals }) => {
		const { database } = locals;
		const api = Api(locals);

		const user = await api.users.fromCookies(cookies);
		if (!user) throw error(404);

		const list = await database.find('lists', { id: params.id });
		if (!list) throw error(404);

		if (!(await api.lists.hasAccess(user, list))) throw error(404);

		const item = await Promise.all([
			database.filter('items', { listId: params.id }),
			database.filter('picks', { listId: params.id }),
			database.filter('boosts', { listId: params.id })
		]).then(([items, picks, boosts]) => pickNext(items, picks, boosts));

		if (!item) return {};

		const pick = {
			id: nanoid(),
			itemId: item.id,
			listId: list.id,
			userId: user.id,
			createTime: new Date().getTime()
		};

		await database.append(user.id, picks.create(pick));

		return { pick };
	}
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const { database } = locals;
	const pick = await database
		.filter('picks', { listId: params.id })
		.then((picks) =>
			picks.reduce(
				(latest, pick) => (pick.createTime <= latest.createTime ? latest : pick),
				picks[0]
			)
		);
	if (!pick) return {};
	const item = await database.find('items', { id: pick.itemId });
	return { pick, item };
};
