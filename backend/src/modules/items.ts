import type { BaseServer } from '@logux/server';

import { ItemValue, createItem, createdItem } from '@picker/protocol';

const ITEMS: Map<string, ItemValue> = new Map();

export default (server: BaseServer) => {
	server.channel('items', {
		access: () => true,
		filter: (ctx) => (otherCtx, otherAction) => {
			if (createdItem.match(otherAction)) {
				return true;
			} else {
				return otherCtx.userId === ctx.userId;
			}
		},
		load: () => Array.from(ITEMS.values()).map(({ id, ...fields }) => createItem({ id, fields }))
	});

	server.channel<{ id: string }>('items/:id', {
		access: () => true
	});

	server.type(createItem, {
		access: () => true,
		process: async (_, { id, fields }) => {
			ITEMS.set(id, { id, ...fields });
			await server.process(createdItem({ id, fields }));
		}
	});

	server.type(createdItem, {
		access: () => false,
		resend: (_, { id }) => ['tasks', `tasks/${id}`]
	});
};
