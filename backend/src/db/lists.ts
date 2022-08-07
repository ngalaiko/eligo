import type { List } from '@picker/protocol';

export type ListRecord = {
	titleChangeTime: number;
} & List;

let lists: ListRecord[] = [];

export default {
	list: (): Promise<ListRecord[]> => Promise.resolve(lists),
	find: ({ id }: { id: string }): Promise<ListRecord | undefined> =>
		Promise.resolve(lists.find((list) => list.id === id)),
	create: (list: ListRecord): Promise<ListRecord> => {
		lists.push(list);
		return Promise.resolve(list);
	},
	change: (id: string, patch: Partial<Omit<ListRecord, 'id'>>): Promise<ListRecord> => {
		lists = lists.map((list) => {
			if (list.id !== id) return list;
			return { ...list, ...patch };
		});
		return Promise.resolve(lists.find((list) => list.id === id)!);
	},
	delete: (id: string) => {
		lists = lists.filter((list) => list.id !== id);
		return Promise.resolve();
	}
};
