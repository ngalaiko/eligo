import { type Action, reduce, emptyState } from '@eligo/state';
import { createWriteStream, readFileSync } from 'fs';

const readData = (filepath: string): Action[] => {
	try {
		return readFileSync(filepath)
			.toString()
			.split('\n')
			.filter((l) => l.length > 0)
			.map((line) => JSON.parse(line));
	} catch (err: any) {
		if (err.code === 'ENOENT') return [];
		throw err;
	}
};

const open = (filepath: string) => {
	const data = readData(filepath);
	let state = data.reduce(reduce, emptyState);
	const writer = createWriteStream(filepath, { flags: 'a' });
	return {
		append: async (userId: string | undefined, action: Action) => {
			action.meta ||= { userId, timestamp: new Date().getTime() };
			state = reduce(state, action);
			writer.write(JSON.stringify(action) + '\n');
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
