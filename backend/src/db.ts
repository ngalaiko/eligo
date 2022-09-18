import { type Action, reduce, emptyState } from '@eligo/state';
import { JSONFile, Low } from 'lowdb';

const open = async (filepath: string) => {
	const adapter = new JSONFile<Action[]>(filepath);
	const db = new Low(adapter);
	await db.read();
	db.data ||= [];
	let state = emptyState;
	for (const action of db.data) {
		state = reduce(state, action);
	}
	return {
		append: async (action: Action) => {
			state = reduce(state, action);
			db.data!.push(action);
			await db.write();
		},

		find: async <K extends keyof typeof state>(
			key: K,
			filter: Partial<typeof state[K][keyof typeof state[K]]>
		): Promise<typeof state[K][keyof typeof state[K]] | undefined> => {
			if (Object.keys(filter).length === 1 && filter.id !== undefined) return state[key][filter.id];
			return Object.values(state[key]).find((value) =>
				Object.entries(filter).every(([k, v]) => value[k] === v)
			);
		},

		filter: async <K extends keyof typeof state>(
			key: K,
			filter: Partial<Omit<typeof state[K][keyof typeof state[K]], 'id'>> = {}
		): Promise<typeof state[K][keyof typeof state[K]][]> => {
			return Object.values(state[key]).filter((value) =>
				Object.entries(filter).every(([k, v]) => value[k] === v)
			);
		}
	};
};

type Unwrap<T> = T extends Promise<infer U>
	? U
	: T extends (...args: any) => Promise<infer U>
	? U
	: T extends (...args: any) => infer U
	? U
	: T;

export type Database = Unwrap<ReturnType<typeof open>>;

export default open;
