import { LogStore, type ID, type AnyAction, type Meta, Action, MemoryStore } from '@logux/core';
import { Adapter, JSONFile, Low, Memory } from 'lowdb';

export const memoryStore = (): LogStore => newStore(new Memory<any>());

export const jsonStore = (filepath: string): LogStore => newStore(new JSONFile<any>(filepath));

const newStore = (adapter: Adapter<any>): LogStore => {
	const db = new Low<any>({
		read: async () => {
			return adapter.read();
		},
		write: async (data: any) => {
			const r = await adapter.write(data);
			return r;
		}
	});
	const store = new MemoryStore();
	const initDB = async () => {
		await db.read();

		db.data ||= {};

		for (let key in db.data) {
			if (!store.hasOwnProperty(key)) continue;
			if (!db.data[key]) continue;
			// @ts-ignore
			store[key] = db.data[key];
		}
	};
	return {
		remove: async (id: ID): Promise<[Action, Meta] | false> => {
			await initDB();
			const r = await store.remove(id);
			await db.write();
			return r;
		},

		add: async (action: AnyAction, meta: Meta) => {
			console.log({ action, meta });
			await initDB();
			const r = await store.add(action, meta);
			for (let key in store) {
				// @ts-ignore
				db.data[key] = store[key];
			}
			await db.write();
			return r;
		},

		byId: async (id: ID) => {
			console.log({ id, store });
			await initDB();
			return await store.byId(id);
		},

		get: async (opts: Parameters<LogStore['get']>[0] = {}) => {
			console.log({ opts });
			await initDB();
			return await store.get(opts);
		},

		changeMeta: async (id: ID, diff: Partial<Meta>) => {
			await initDB();
			const result = await store.changeMeta(id, diff);
			for (let key in store) {
				// @ts-ignore
				db.data[key] = store[key];
			}
			await db.write();
			return result;
		},

		removeReason: async (
			reason: Parameters<LogStore['removeReason']>[0],
			criteria: Parameters<LogStore['removeReason']>[1],
			callback: Parameters<LogStore['removeReason']>[2]
		) => {
			console.log({ reason, criteria, callback });
			await initDB();
			const result = await store.removeReason(reason, criteria, callback);
			for (let key in store) {
				// @ts-ignore
				db.data[key] = store[key];
			}
			await db.write();
			return result;
		},

		clean: async () => {
			await initDB();
			const result = await store.clean();
			await db.write();
			return result;
		},

		getLastAdded: async () => {
			await initDB();
			return await store.getLastAdded();
		},

		getLastSynced: async () => {
			await initDB();
			return await store.getLastSynced();
		},

		setLastSynced: async (values: Parameters<LogStore['setLastSynced']>[0]) => {
			await initDB();
			const result = await store.setLastSynced(values);
			for (let key in store) {
				// @ts-ignore
				db.data[key] = store[key];
			}
			await db.write();
			return result;
		}
	};
};
