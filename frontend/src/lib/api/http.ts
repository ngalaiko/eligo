import type { Membership, Error as APIError } from '@eligo/protocol';

const host =
	process.env.NODE_ENV === 'production' ? 'https://api.eligo.rocks/' : 'http://localhost:31337/';

export const httpHost = host;
export const wsHost = host.replace('http', 'ws');

export class HTTPError extends Error {
	status: number;
	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

const handleResponse = async (res: Response): Promise<any> => {
	if (res.status === 204) return undefined;
	if (res.status === 200) return res.json();
	if (Math.floor(res.status / 100) === 4) {
		const error: APIError = await res.json();
		throw new HTTPError(res.status, error.message);
	}
	throw new HTTPError(res.status, 'Something went wrong');
};

export const join = (params: { invitationId: string }): Promise<Membership> =>
	fetch(new URL(`/join/${params.invitationId}`, httpHost).toString(), {
		method: 'POST',
		credentials: 'include'
	}).then(handleResponse);

export const signup = (params: {
	name: string;
	password: string;
}): Promise<{ id: string; name: string }> =>
	fetch(new URL('/users', httpHost).toString(), {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'content-type': 'application/json'
		},
		credentials: 'include'
	}).then(handleResponse);

export const login = (params: {
	name: string;
	password: string;
}): Promise<{ id: string; name: string }> =>
	fetch(new URL('/auth', httpHost).toString(), {
		method: 'POST',
		body: JSON.stringify(params),
		headers: {
			'content-type': 'application/json'
		},
		credentials: 'include'
	}).then(handleResponse);

export const logout = () =>
	fetch(new URL('/auth', httpHost).toString(), {
		method: 'DELETE',
		credentials: 'include'
	}).then(handleResponse);

export const updateUser = (
	id: string,
	fields: Partial<{ password: string }>
): Promise<{ id: string; name: string }> =>
	fetch(new URL(`/users/${id}`, httpHost).toString(), {
		method: 'PATCH',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(fields)
	}).then(handleResponse);
