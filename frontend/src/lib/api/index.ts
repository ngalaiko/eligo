const host =
	process.env.NODE_ENV === 'production'
		? 'https://api.eligo.rocks/'
		: 'http://127.0.0.1:31337/';

export const httpHost = host;
export const wsHost = host.replace('http', 'ws');

export const logout = () =>
	fetch(new URL('/auth', httpHost).toString(), {
		method: 'DELETE',
		credentials: 'include'
	});

export const updateUser = (id: string, fields: Partial<{ password: string }>) =>
	fetch(new URL(`/users/${id}`, httpHost).toString(), {
		method: 'PATCH',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(fields)
	});

export const createSubscription = (subscription: PushSubscriptionJSON) =>
	fetch(new URL('/subscriptions', httpHost).toString(), {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(subscription)
	});

export const removeSubscription = (subscription: PushSubscription) =>
	fetch(
		new URL(`/subscriptions/${encodeURIComponent(subscription.endpoint)}`, httpHost).toString(),
		{
			method: 'DELETE',
			credentials: 'include'
		}
	);
