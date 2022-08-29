import { LogStore, type ID, type AnyAction, type Meta, Action, MemoryStore } from '@logux/core';
import { Adapter, JSONFile, Low, Memory } from 'lowdb';

// type Index = {
// 	added: Entry[];
// 	entries: Entry[];
// };

// type Entry = [AnyAction, Meta];

// const eject = (store: Index, meta: Meta) => {
// 	const added = meta.added;
// 	let start = 0;
// 	let end = store.added.length - 1;
// 	while (start <= end) {
// 		const middle = (end + start) >> 1;
// 		const otherAdded = store.added[middle][1].added;
// 		if (otherAdded < added) {
// 			start = middle + 1;
// 		} else if (otherAdded > added) {
// 			end = middle - 1;
// 		} else {
// 			store.added.splice(middle, 1);
// 			break;
// 		}
// 	}
// };

// const find = (list: Entry[], id: ID) => {
// 	for (let i = list.length - 1; i >= 0; i--) {
// 		if (id === list[i][1].id) {
// 			return i;
// 		}
// 	}
// 	return -1;
// };

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

// const store = () => {
// 	const forEachIndex = (meta: Meta, cb: (index: string) => void) => {
// 		let indexes = meta.indexes;
// 		if (indexes && indexes.length > 0) {
// 			for (let index of indexes) {
// 				cb(index);
// 			}
// 		}
// 	};

// 	const checkIndex = (data: Data, index: string) => {
// 		if (!data.indexes[index]) {
// 			data.indexes[index] = { added: [], entries: [] };
// 		}
// 	};

// 	const insert = (data: Data, entry: Entry) => {
// 		data.lastAdded += 1;
// 		entry[1].added = data.lastAdded;
// 		data.added.push(entry);
// 		forEachIndex(entry[1], (index) => {
// 			checkIndex(data, index);
// 			data.indexes[index].added.push(entry);
// 		});
// 		return Promise.resolve(entry[1]);
// 	};

// 	const remove = async (data: Data, id: ID, created?: number): Promise<[Action, Meta] | false> => {
// 		if (typeof created === 'undefined') {
// 			created = find(data.entries, id);
// 			if (created === -1) return Promise.resolve(false);
// 		}

// 		const entry: Entry = [data.entries[created][0], data.entries[created][1]];
// 		forEachIndex(entry[1], (index) => {
// 			let entries = data.indexes[index].entries;
// 			let indexed = find(entries, id);
// 			if (indexed !== -1) entries.splice(indexed, 1);
// 		});
// 		data.entries.splice(created, 1);

// 		forEachIndex(entry[1], (index) => {
// 			eject(data.indexes[index], entry[1]);
// 		});
// 		eject(data, entry[1]);

// 		return entry;
// 	};

// 	return {
// 		add: async (data: Data, action: AnyAction, meta: Meta) => {
// 			const entry: Entry = [action, meta];
// 			const id = meta.id;

// 			let list = data.entries;
// 			for (let i = 0; i < list.length; i++) {
// 				let [, otherMeta] = list[i];
// 				if (id === otherMeta.id) {
// 					return false;
// 				} else if (!isFirstOlder(otherMeta, meta)) {
// 					forEachIndex(meta, (index) => {
// 						checkIndex(data, index);
// 						let indexList = data.indexes[index].entries;
// 						let j = indexList.findIndex((item) => !isFirstOlder(item[1], meta));
// 						indexList.splice(j, 0, entry);
// 					});
// 					list.splice(i, 0, entry);
// 					return insert(data, entry);
// 				}
// 			}

// 			forEachIndex(meta, (index) => {
// 				checkIndex(data, index);
// 				data.indexes[index].entries.push(entry);
// 			});
// 			list.push(entry);
// 			return insert(data, entry);
// 		},

// 		byId: async (data: Data, id: ID) => {
// 			const created = find(data.entries, id);
// 			if (created === -1) {
// 				return [null, null];
// 			} else {
// 				const [action, meta] = data.entries[created];
// 				return [action, meta];
// 			}
// 		},

// 		remove,

// 		get: async (data: Data, opts: Parameters<LogStore['get']>[0] = {}) => {
// 			let index = opts.index;
// 			let store: Index = data;
// 			if (index) {
// 				store = data.indexes[index] || { added: [], entries: [] };
// 			}
// 			return { entries: opts.order === 'created' ? store.entries : store.added };
// 		},

// 		changeMeta: async (data: Data, id: ID, diff: Partial<Meta>) => {
// 			let index = find(data.entries, id);
// 			if (index === -1) {
// 				return false;
// 			} else {
// 				let meta = data.entries[index][1];
// 				for (let key in diff) meta[key] = diff[key];
// 				return true;
// 			}
// 		},

// 		removeReason: async (
// 			reason: Parameters<LogStore['removeReason']>[0],
// 			criteria: Parameters<LogStore['removeReason']>[1],
// 			callback: Parameters<LogStore['removeReason']>[2]
// 		) => {
// 			let removed: Meta[] = [];

// 			if (criteria.id) {
// 				let index = find(data.entries, criteria.id);
// 				if (index !== -1) {
// 					let meta = data.entries[index][1];
// 					let reasonPos = meta.reasons.indexOf(reason);
// 					if (reasonPos !== -1) {
// 						meta.reasons.splice(reasonPos, 1);
// 						if (meta.reasons.length === 0) {
// 							callback(data.entries[index][0], meta);
// 							remove(criteria.id);
// 						}
// 					}
// 				}
// 			} else {
// 				data.entries = data.entries.filter(([action, meta]) => {
// 					let c = criteria;

// 					let reasonPos = meta.reasons.indexOf(reason);
// 					if (reasonPos === -1) {
// 						return true;
// 					}
// 					if (c.olderThan && !isFirstOlder(meta, c.olderThan)) {
// 						return true;
// 					}
// 					if (c.youngerThan && !isFirstOlder(c.youngerThan, meta)) {
// 						return true;
// 					}
// 					if (c.minAdded && meta.added < c.minAdded) {
// 						return true;
// 					}
// 					if (c.maxAdded && meta.added > c.maxAdded) {
// 						return true;
// 					}

// 					meta.reasons.splice(reasonPos, 1);
// 					if (meta.reasons.length === 0) {
// 						callback(action, meta);
// 						removed.push(meta);
// 						return false;
// 					} else {
// 						return true;
// 					}
// 				});

// 				let removedAdded = removed.map((m) => m.added);
// 				let removing = (i: Entry) => !removedAdded.includes(i[1].added);
// 				data.added = data.added.filter(removing);

// 				for (let meta of removed) {
// 					forEachIndex(meta, (i) => {
// 						data.indexes[i].entries = data.indexes[i].entries.filter(removing);
// 						data.indexes[i].added = data.indexes[i].added.filter(removing);
// 					});
// 				}
// 			}
// 		},

// 		clean: async () => {
// 			data.entries = [];
// 			data.added = [];
// 			data.indexes = {};
// 			data.lastReceived = 0;
// 			data.lastAdded = 0;
// 			data.lastSent = 0;
// 		},

// 		getLastAdded: async () => {
// 			return data.lastAdded;
// 		},

// 		getLastSynced: async () => {
// 			return {
// 				received: data.lastReceived,
// 				sent: data.lastSent
// 			};
// 		},

// 		setLastSynced: async (values: Parameters<LogStore['setLastSynced']>[0]) => {
// 			if (typeof values.sent !== 'undefined') {
// 				data.lastSent = values.sent;
// 			}
// 			if (typeof values.received !== 'undefined') {
// 				data.lastReceived = values.received;
// 			}
// 		}
// 	};
// };
