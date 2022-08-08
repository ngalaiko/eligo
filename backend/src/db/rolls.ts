import type { Roll } from '@picker/protocol';

export type RollRecord = Roll;

let rolls: RollRecord[] = [];

export default {
	list: (filter: { listId?: string } = {}): Promise<RollRecord[]> =>
		Promise.resolve(
			rolls.filter((roll) => {
				if (filter.listId) return roll.listId === filter.listId;
				return true;
			})
		),
	find: ({ id }: { id: string }): Promise<RollRecord | undefined> =>
		Promise.resolve(rolls.find((roll) => roll.id === id)),
	create: (roll: RollRecord): Promise<RollRecord> => {
		rolls.push(roll);
		return Promise.resolve(roll);
	},
	change: (id: string, patch: Partial<Omit<RollRecord, 'id'>>): Promise<RollRecord> => {
		rolls = rolls.map((roll) => {
			if (roll.id !== id) return roll;
			return { ...roll, ...patch };
		});
		return Promise.resolve(rolls.find((roll) => roll.id === id)!);
	}
};
