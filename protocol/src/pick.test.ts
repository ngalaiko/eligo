import { test } from 'uvu';
import { equal } from 'uvu/assert';
import { getWeights } from './pick';
import { Boost, Item, Pick } from './types';

let i = 0;

const testItem = (): Item => {
	const id = (++i).toString();
	return {
		id,
		text: `item ${id}`,
		listId: `list ${id}`,
		userId: `user ${id}`,
		createTime: i
	};
};

const testBoost = (item: Item): Boost => {
	const id = (++i).toString();
	return {
		id,
		listId: item.listId,
		userId: `user ${id}`,
		createTime: i,
		itemId: item.id
	};
};

const testPick = (item: Item): Pick => {
	const id = (++i).toString();
	return {
		id,
		listId: item.listId,
		userId: `user ${id}`,
		createTime: i,
		itemId: item.id
	};
};

test('getWeights() without anything', () => equal(getWeights([], [], []), {}));

test('getWeights() with a single item', () => {
	const items = [testItem()];
	equal(getWeights(items, [], []), { [items[0].id]: 1 });
});

test('getWeights() with a deleted item', () => {
	const items = [{ ...testItem(), deleteTime: 1 }, testItem()];
	equal(getWeights(items, [], []), { [items[0].id]: 0, [items[1].id]: 1 });
});

test('getWeights() with two items', () => {
	const items = [testItem(), testItem()];
	equal(getWeights(items, [], []), { [items[0].id]: 1, [items[1].id]: 1 });
});

test('getWeights() with two items and pick', () => {
	const items = [testItem(), testItem()];
	const picks = [testPick(items[0])];
	equal(getWeights(items, picks, []), { [items[0].id]: 1, [items[1].id]: 2 });
});

test('getWeights() with two items and two picks', () => {
	const items = [testItem(), testItem()];
	const picks = [testPick(items[0]), testPick(items[0])];
	equal(getWeights(items, picks, []), { [items[0].id]: 1, [items[1].id]: 3 });
});

test('getWeights() with two items and three picks', () => {
	const items = [testItem(), testItem()];
	const picks = [testPick(items[0]), testPick(items[0]), testPick(items[0])];
	equal(getWeights(items, picks, []), { [items[0].id]: 1, [items[1].id]: 3 });
});

test('getWeights() with two items and three picks', () => {
	const items = [testItem(), testItem()];
	const picks = [testPick(items[0]), testPick(items[0]), testPick(items[0])];
	equal(getWeights(items, picks, []), { [items[0].id]: 1, [items[1].id]: 3 });
});

test('getWeights() with three items and three picks', () => {
	const items = [testItem(), testItem(), testItem()];
	const picks = [testPick(items[0]), testPick(items[1]), testPick(items[0])];
	equal(getWeights(items, picks, []), { [items[0].id]: 1, [items[1].id]: 2, [items[2].id]: 4 });
});

test('getWeights() with three items, three picks and boost', () => {
	const items = [testItem(), testItem(), testItem()];
	const picks = [testPick(items[0]), testPick(items[1]), testPick(items[0])];
	const boosts = [testBoost(items[0])];
	equal(getWeights(items, picks, boosts), { [items[0].id]: 5, [items[1].id]: 2, [items[2].id]: 4 });
});

test('getWeights() with three items, three picks and two boosts', () => {
	const items = [testItem(), testItem(), testItem()];
	const picks = [testPick(items[0]), testPick(items[1]), testPick(items[0])];
	const boosts = [testBoost(items[0]), testBoost(items[0])];
	equal(getWeights(items, picks, boosts), {
		[items[0].id]: 25,
		[items[1].id]: 2,
		[items[2].id]: 4
	});
});

test.run();
