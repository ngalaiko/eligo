import { httpHost } from '$lib/api';
import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { serialize } from 'cookie';

export const POST: RequestHandler = ({ request }) =>
	request
		.json()
		.then(({ name, password }) =>
			fetch(new URL('/users', httpHost), {
				method: 'POST',
				body: JSON.stringify({ name, password })
			})
		)
		.then(async (res) =>
			res.status === 200
				? res.json().then(
						({ id, name, token }) =>
							new Response(JSON.stringify({ id, name, token }), {
								status: 200,
								headers: {
									'set-cookie': serialize('token', token, {
										httpOnly: true,
										expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // one month
										path: '/'
									})
								}
							})
				  )
				: res.text().then((text) => {
						throw error(res.status, text);
				  })
		);
