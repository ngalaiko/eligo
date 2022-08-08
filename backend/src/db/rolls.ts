import type { Roll } from '@picker/protocol';

export type RollRecord = Roll;

let rolls: RollRecord[] = [];

export default {
	list: (): Promise<RollRecord[]> => Promise.resolve(rolls),
	find: ({ id }: { id: string }): Promise<RollRecord | undefined> =>
		Promise.resolve(rolls.find((roll) => roll.id === id)),
	create: (roll: RollRecord): Promise<RollRecord> => {
		rolls.push(roll);
		return Promise.resolve(roll);
	}
};
