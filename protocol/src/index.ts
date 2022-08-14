export const subprotocol = '1.0.0';

export type User = {
	id: string;
	name: string;
};

export type List = {
	id: string;
	title: string;
	userId: string;
	createTime: number;
};

export type Item = {
	id: string;
	text: string;
	listId: string;
	userId: string;
	createTime: number;
};

export type Pick = {
	id: string;
	listId: string;
	userId: string;
	itemId?: string;
	createTime: number;
};
