export const SUBPROTOCOL = '1.0.0';

import { defineSyncMapActions } from '@logux/actions';

//
// Items
//

export type ItemValue = {
	id: string;
	text: string;
};

export const [createItem, changeItem, deleteItem, createdItem, changedItem, deletedItem] =
	defineSyncMapActions<ItemValue>('items');

export type CreateItem = ReturnType<typeof createItem>;
export type CreatedItem = ReturnType<typeof createdItem>;

//
// Lists
//

export type ListValue = {
	id: string;
	title: string;
};

export const [createList, changeList, deleteList, createdList, changedList, deletedList] =
	defineSyncMapActions<ListValue>('lists');

export type CreateList = ReturnType<typeof createList>;
export type CreatedList = ReturnType<typeof createdList>;
