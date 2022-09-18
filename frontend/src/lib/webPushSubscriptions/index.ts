import { auth, send } from '$lib/api';
import { webPushSuscriptions } from '@eligo/state';
import { get } from 'svelte/store';

export { default as Button } from './Button.svelte';

export const create = (params: {
	endpoint: string;
	expirationTime: number;
	keys: {
		auth: string;
		p256dh: string;
	};
}) =>
	send(
		webPushSuscriptions.create({
			...params,
			id: params.endpoint,
			userId: get(auth).user.id!,
			createTime: new Date().getTime()
		})
	);

const _delete = (params: { id: string }) =>
	send(
		webPushSuscriptions.delete({
			...params
		})
	);
export { _delete as delete };
