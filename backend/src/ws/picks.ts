import { type Item, type Pick, type Boost, getWeights } from '@eligo/protocol';
import { picks } from '@eligo/state';
import type { Socket, Server } from 'socket.io';
import type { Database } from '../db.js';
import { Notifications } from '../notifications.js';
import { validate } from '../validation.js';
import randomGenerator from '../random.js';

const generator = randomGenerator();

const weightedRandom = (weights: number[]) => {
	const sum = weights.reduce((a, b) => a + b, 0);
	const r = generator.next() * sum;
	let acc = 0;
	for (let i = 0; i < weights.length; i++) {
		acc += weights[i];
		if (r < acc) {
			return i;
		}
	}
	return weights.length - 1;
};

const pickNext = (items: Item[], picks: Pick[], boosts: Boost[]) => {
	if (items.length === 0) return undefined;
	const itemIds = items.map((item) => item.id);
	const weightByItemId = getWeights(items, picks, boosts);
	const weights = itemIds.map((itemId) => weightByItemId[itemId]);
	return items[weightedRandom(weights)];
};

export default (io: Server, socket: Socket, database: Database, notifications: Notifications) => {
	socket.on(picks.create.type, async (req: Partial<Pick>, callback) => {
		const validationErr = validate(req, {
			id: 'required',
			listId: 'required',
			userId: socket.data.userId,
			itemId: 'empty',
			createTime: 'required'
		});
		if (validationErr) {
			callback(validationErr);
			return;
		}

		let pick = req as Pick;

		const randomItem = await Promise.all([
			database.filter('items', { listId: pick.listId }),
			database.filter('picks', { listId: pick.listId }),
			database.filter('boosts', { listId: pick.listId })
		]).then(([items, picks, boosts]) => pickNext(items, picks, boosts));
		if (!randomItem) {
			callback(new Error('not found'));
			return;
		}

		pick = { ...pick, itemId: randomItem.id };

		await database.append(socket.data.userId, picks.create(pick));
		const created = picks.created(pick);

		socket.join(created.payload.id);
		io.to([created.payload.id, created.payload.listId]).emit(created.type, created.payload);

		Promise.all([
			database.find('users', { id: pick.userId }),
			database.find('lists', { id: pick.listId }),
			database.filter('memberships', { listId: pick.listId })
		]).then(([user, list, memberships]) => {
			if (!list) return;
			if (!user) return;

			const membersIds = memberships.map(({ userId }) => userId);
			const userIds = [...membersIds, list.userId].filter((userId) => userId !== pick.userId);
			new Set(userIds).forEach((userId) =>
				notifications.notify(userId, {
					title: `New pick`,
					options: {
						body: `${user.name} picked ${randomItem.text} in ${list.title}`
					}
				})
			);
		});

		callback(null);
	});
};
