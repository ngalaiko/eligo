export const subprotocol = '1.0.0';

export type User = {
	name: string;
};

export type List = {
	title: string;
	userId: string;
	createTime: number;
	invitatationId?: string;
};

export type Membership = {
	listId: string;
	userId: string;
	createTime: number;
};

export type Item = {
	text: string;
	listId: string;
	userId: string;
	createTime: number;
};

export type Pick = {
	listId: string;
	userId: string;
	itemId?: string;
	createTime: number;
};

export type Boost = {
	userId: string;
	listId: string;
	itemId: string;
	createTime: number;
};
