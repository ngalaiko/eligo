import type { RequestHandler } from '@sveltejs/kit';
import { serialize } from 'cookie';

const apiHost = 'http://127.0.0.1:31337/';

export const DELETE: RequestHandler = () => ({
	status: 204,
	headers: {
		'set-cookie': serialize('token', '', {
			httpOnly: true,
			expires: new Date(0),
			path: '/'
		})
	}
});

export const POST: RequestHandler = ({ request }) =>
	request
		.json()
		.then(({ name, password }) =>
			fetch(new URL('/auth', apiHost), {
				method: 'POST',
				body: JSON.stringify({ name, password })
			})
		)
		.then(async (res) =>
			res.status === 200
				? res.json().then(({ id, name, token }) => ({
						status: 200,
						body: { id, name, token },
						headers: {
							'set-cookie': serialize('token', token, {
								httpOnly: true,
								expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // one month
								path: '/'
							})
						}
				  }))
				: res.text().then((text) => ({
						status: res.status,
						body: text
				  }))
		);
