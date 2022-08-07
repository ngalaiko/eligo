import type { Item } from '@picker/protocol';

export type ItemRecord = {
	textChangeTime: number;
} & Item;

const items: ItemRecord[] = [];

export default {
	list: (): Promise<ItemRecord[]> => Promise.resolve(items),
	find: ({ id }: { id: string }) => Promise.resolve(items.find((item) => item.id === id)),
	create: (item: ItemRecord): Promise<ItemRecord> => {
		items.push(item);
		return Promise.resolve(item);
	}
};
