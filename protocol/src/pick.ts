import type { Pick, Item, Boost } from './api';

const boostMultiplier = 5;

// given a list of items and history of it's picks, returns a list of weights for each item
export const getWeights = (
	items: (Item & { id: string })[],
	picks: Pick[],
	boosts: Boost[]
): Record<string, number> => {
	const itemIds = items.map((item) => item.id);
	let itemIdsHistory = picks.filter(({ itemId }) => itemId).map(({ itemId }) => itemId!);
	itemIdsHistory = itemIdsHistory.slice(Math.max(itemIdsHistory.length - itemIds.length, 0));
	const activeBoosts = boosts
		.filter((boost) => {
			if (picks.length === 0) return true;
			const latestPick = picks.sort((a, b) => a.createTime - b.createTime).slice(-1)[0];
			return boost.createTime > latestPick.createTime;
		})
		.reduce((acc, boost) => {
			if (!acc[boost.itemId]) {
				acc[boost.itemId] = 0;
			}
			acc[boost.itemId] = acc[boost.itemId] + 1;
			return acc;
		}, {} as Record<string, number>);
	const weigts = itemIds.map((itemId) => {
		const pickedAgo = itemIdsHistory.length - itemIdsHistory.lastIndexOf(itemId);
		const wasPicked = pickedAgo !== -1;
		let weight = wasPicked
			? pickedAgo > itemIds.length
				? itemIds.length
				: pickedAgo
			: itemIds.length;
		for (let i = 0; i < activeBoosts[itemId] ?? 0; i++) {
			weight *= boostMultiplier;
		}
		return { itemId, weight };
	});
	return weigts.reduce((acc, { itemId, weight }) => ({ ...acc, [itemId]: weight }), {});
};
