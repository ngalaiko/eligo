export const notDeleted = <T extends { deleteTime?: number }>({ deleteTime }: T) =>
	deleteTime === undefined;

export const notNull = <T extends any>(obj: T | undefined) => obj !== undefined && obj !== null;

export const unique = <T extends any>(value: T, index: number, all: T[]) =>
	all.indexOf(value) === index;

export const flatten = (arrayOfArrays: any[][]) => arrayOfArrays.flatMap((array) => array);

export const merge = <
	T extends { id: string; createTime: number; updateTime?: number; deleteTime?: number }
>(
	...values: T[][]
) => {
	const byId = new Map<string, T>();
	flatten(values).forEach((item: T) => {
		const existing = byId.get(item.id);
		if (!existing) {
			byId.set(item.id, item);
		} else {
			const existingTs = Math.max(
				existing.createTime,
				Math.max(existing.updateTime ?? 0, existing.deleteTime ?? 0)
			);
			const itemTs = Math.max(
				item.updateTime ?? 0,
				Math.max(item.createTime, item.deleteTime ?? 0)
			);
			if (itemTs >= existingTs) byId.set(item.id, item);
		}
	});
	return Array.from(byId.values());
};
