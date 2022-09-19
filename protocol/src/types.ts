export type Error = {
	code: string;
	message: string;
};

export type WebNotification = {
	title: string;
	options: {
		body: string;
	};
};

export type WebPushSubscription = {
	id: string;
	endpoint: string;
	userId: string;
	expirationTime: EpochTimeStamp | null;
	keys: { p256dh: string; auth: string };
	createTime: EpochTimeStamp;
};

export type JWTPublicKey = {
	id: string;
	spki: string;
	alg: string;
	createTime: EpochTimeStamp;
};

export type User = {
	id: string;
	name: string;
	hash?: string;
	createTime: EpochTimeStamp;
};

export type List = {
	id: string;
	title: string;
	userId: string;
	invitatationId?: string;
	createTime: EpochTimeStamp;
};

export type Membership = {
	id: string;
	listId: string;
	userId: string;
	createTime: EpochTimeStamp;
};

export type Item = {
	id: string;
	text: string;
	listId: string;
	userId: string;
	createTime: EpochTimeStamp;
};

export type Pick = {
	id: string;
	listId: string;
	userId: string;
	itemId?: string;
	createTime: EpochTimeStamp;
};

export type Boost = {
	id: string;
	userId: string;
	listId: string;
	itemId: string;
	createTime: EpochTimeStamp;
};
