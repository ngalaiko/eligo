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

type Type<T extends any> = T & {
	id: string;
	createTime: EpochTimeStamp;
	updateTime?: EpochTimeStamp;
	deleteTime?: EpochTimeStamp;
};

export type WebPushSubscription = Type<{
	id: string;
	endpoint: string;
	userId: string;
	expirationTime: EpochTimeStamp | null;
	keys: { p256dh: string; auth: string };
}>;

export type JWTPublicKey = Type<{
	spki: string;
	alg: string;
}>;

export type User = Type<{
	name: string;
	displayName?: string;
	hash?: string;
}>;

export type List = Type<{
	title: string;
	userId: string;
	invitatationId?: string;
}>;

export type Membership = Type<{
	listId: string;
	userId: string;
}>;

export type Item = Type<{
	text: string;
	listId: string;
	userId: string;
}>;

export type Pick = Type<{
	listId: string;
	userId: string;
	itemId?: string;
}>;

export type Boost = Type<{
	userId: string;
	listId: string;
	itemId: string;
}>;
