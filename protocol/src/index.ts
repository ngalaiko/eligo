export const SUBPROTOCOL = '1.0.0';

import { defineSyncMapActions } from '@logux/actions';

export type ItemValue = {
	id: string;
	text: string;
};

export const [createItem, changeItem, deleteItem, createdItem, changedItem, deletedItem] =
	defineSyncMapActions<ItemValue>('items');

export type CreateItem = ReturnType<typeof createItem>;
export type CreatedItem = ReturnType<typeof createdItem>;
