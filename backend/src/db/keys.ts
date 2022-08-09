import { KeyLike } from 'jose';

export type KeyRecord = {
	id: string;
	publicKey: KeyLike;
	alg: string;
};

const keys: KeyRecord[] = [];

export default {
	find: ({ id }: { id: string }) => Promise.resolve(keys.find((key) => key.id === id)),
	create: (key: KeyRecord): Promise<KeyRecord> => {
		keys.push(key);
		return Promise.resolve(key);
	}
};
