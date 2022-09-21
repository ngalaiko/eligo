import type { Pick, Item, Boost } from './types';

const boostMultiplier = 5;

const byCreateTimeAsc = (a: { createTime: number }, b: { createTime: number }) =>
	a.createTime - b.createTime;

// given a list of items and history of it's picks, returns a list of weights for each item
export const getWeights = (
	items: Item[],
	picks: Pick[],
	boosts: Boost[]
): Record<string, number> => {
	const deletedItemIds = new Set(
		items.filter(({ deleteTime }) => !!deleteTime).map(({ id }) => id)
	);

	items = items.slice().sort(byCreateTimeAsc);
	picks = picks
		.slice()
		.filter(({ id }) => !deletedItemIds.has(id))
		.sort(byCreateTimeAsc);
	boosts = boosts
		.slice()
		.filter(({ id }) => !deletedItemIds.has(id))
		.sort(byCreateTimeAsc);

	const activeBoosts = boosts
		.filter((boost) => {
			if (picks.length === 0) return true;
			const latestPick = picks.slice(-1)[0];
			return boost.createTime > latestPick.createTime;
		})
		.reduce((acc, boost) => {
			if (!acc[boost.itemId]) {
				acc[boost.itemId] = 0;
			}
			acc[boost.itemId] = acc[boost.itemId] + 1;
			return acc;
		}, {} as Record<string, number>);

	let itemIdsHistory = picks.filter(({ itemId }) => itemId).map(({ itemId }) => itemId!);
	itemIdsHistory = itemIdsHistory.slice(Math.max(itemIdsHistory.length - items.length, 0));

	const weigts = items.map(({ id: itemId }) => {
		if (deletedItemIds.has(itemId)) return { itemId, weight: 0 };
		let weight = itemIdsHistory.length - itemIdsHistory.lastIndexOf(itemId);
		for (let i = 0; i < activeBoosts[itemId] ?? 0; i++) {
			weight *= boostMultiplier;
		}
		return { itemId, weight };
	});
	return weigts.reduce((acc, { itemId, weight }) => ({ ...acc, [itemId]: weight }), {});
};
