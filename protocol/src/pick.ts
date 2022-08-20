import type { Pick, Item } from './api';

// given a list of items and history of it's picks, returns a list of weights for each item
export const getWeights = (
	items: (Item & { id: string })[],
	picks: Pick[]
): Record<string, number> => {
	const itemIds = items.map((item) => item.id);
	let itemIdsHistory = picks.filter(({ itemId }) => itemId).map(({ itemId }) => itemId!);
	itemIdsHistory = itemIdsHistory.slice(Math.max(itemIdsHistory.length - itemIds.length, 0));
	const weigts = itemIds.map((itemId) => {
		const pickedAgo = itemIdsHistory.length - itemIdsHistory.lastIndexOf(itemId);
		const wasPicked = pickedAgo !== -1;
		return wasPicked ? { itemId, weight: pickedAgo } : { itemId, weight: itemIds.length };
	});
	return weigts.reduce((acc, { itemId, weight }) => ({ ...acc, [itemId]: weight }), {});
};
