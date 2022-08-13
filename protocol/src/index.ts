export const subprotocol = '1.0.0';

export type User = {
	id: string;
	name: string;
};

export type List = {
	id: string;
	title: string;
	userId: string;
};

export type Item = {
	id: string;
	text: string;
	listId: string;
	userId: string;
};

export type Roll = {
	id: string;
	listId: string;
	userId: string;
	itemId?: string;
};
