import type { List } from '@picker/protocol';

export type ListRecord = {
	titleChangeTime: number;
} & List;

const lists: ListRecord[] = [];

export default {
	list: (): Promise<ListRecord[]> => Promise.resolve(lists),
	find: ({ id }: { id: string }): Promise<ListRecord | undefined> =>
		Promise.resolve(lists.find((list) => list.id === id)),
	create: (list: ListRecord): Promise<ListRecord> => {
		lists.push(list);
		return Promise.resolve(list);
	}
};
