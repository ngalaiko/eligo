import type { BaseServer } from '@logux/server';

import { ListValue, createList, createdList } from '@picker/protocol';

const LISTS: Map<string, ListValue> = new Map();

export default (server: BaseServer) => {
	server.channel('lists', {
		access: () => true,
		filter: (ctx) => (otherCtx, otherAction) => {
			if (createdList.match(otherAction)) {
				return true;
			} else {
				return otherCtx.userId === ctx.userId;
			}
		},
		load: () => Array.from(LISTS.values()).map(({ id, ...fields }) => createdList({ id, fields }))
	});

	server.channel<{ id: string }>('lists/:id', {
		access: () => true
	});

	server.type(createList, {
		access: () => true,
		process: async (_, { id, fields }) => {
			LISTS.set(id, { id, ...fields });
			await server.process(createdList({ id, fields }));
		}
	});

	server.type(createdList, {
		access: () => false,
		resend: (_, { id }) => ['lists', `lists/${id}`]
	});
};
