import type { RequestHandler } from './$types';
import Api from '$lib/server/api';
import { webPushSuscriptions } from '@eligo/protocol';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const user = await Api(locals).users.fromCookies(cookies);
	if (!user) throw error(404);

	const webPushSubscriptionRequest: Partial<PushSubscriptionJSON> = await request
		.json()
		.catch(() => {
			throw error(415);
		});

	if (!webPushSubscriptionRequest.endpoint) throw error(400, 'endpoint is required');
	if (webPushSubscriptionRequest.expirationTime === undefined)
		throw error(400, 'expirationTime is required');
	if (!webPushSubscriptionRequest.keys) throw error(400, 'keys is required');
	if (!webPushSubscriptionRequest.keys.auth) throw error(400, 'keys.auth is required');
	if (!webPushSubscriptionRequest.keys.p256dh) throw error(400, 'keys.p256dh is required');

	const { database } = locals;

	database.append(
		user.id,
		webPushSuscriptions.create({
			id: webPushSubscriptionRequest.endpoint,
			userId: user.id,
			endpoint: webPushSubscriptionRequest.endpoint,
			expirationTime: webPushSubscriptionRequest.expirationTime,
			keys: {
				auth: webPushSubscriptionRequest.keys.auth,
				p256dh: webPushSubscriptionRequest.keys.p256dh
			},
			createTime: new Date().getTime()
		})
	);

	return new Response(null, { status: 204 });
};

export const DELETE: RequestHandler = async ({ request, cookies, locals }) => {
	const user = await Api(locals).users.fromCookies(cookies);
	if (!user) throw error(404);

	const webPushSubscriptionRequest: Partial<{ endpoint: string }> = await request
		.json()
		.catch(() => {
			throw error(415);
		});

	const { database } = locals;

	const webPushSuscription = await database.find('webPushSuscriptions', {
		id: webPushSubscriptionRequest.endpoint,
		userId: user.id
	});
	if (!webPushSuscription) return new Response(null, { status: 404 });

	if (webPushSuscription.userId !== user.id) throw error(403);

	database.append(
		user.id,
		webPushSuscriptions.delete({
			id: webPushSuscription.endpoint,
			deleteTime: new Date().getTime()
		})
	);

	return new Response(JSON.stringify(webPushSuscription), { status: 200 });
};
