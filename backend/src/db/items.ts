import type { Item } from '@velit/protocol';

export type ItemRecord = {
	textChangeTime: number;
} & Item;

let items: ItemRecord[] = [];

export default {
	list: (filter: { listId?: string } = {}): Promise<ItemRecord[]> =>
		Promise.resolve(
			items.filter(({ listId }) => {
				if (filter.listId) return listId === filter.listId;
				return true;
			})
		),
	find: ({ id }: { id: string }) => Promise.resolve(items.find((item) => item.id === id)),
	create: (item: ItemRecord): Promise<ItemRecord> => {
		items.push(item);
		return Promise.resolve(item);
	},
	change: (id: string, patch: Partial<Omit<ItemRecord, 'id'>>): Promise<ItemRecord> => {
		items = items.map((item) => {
			if (item.id !== id) return item;
			return { ...item, ...patch };
		});
		return Promise.resolve(items.find((item) => item.id === id)!);
	},
	delete: (id: string) => {
		items = items.filter((item) => item.id !== id);
		return Promise.resolve();
	}
};
