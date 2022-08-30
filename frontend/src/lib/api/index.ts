const host =
	process.env.NODE_ENV === 'production'
		? 'https://api.eligo.galaiko.rocks/'
		: 'http://127.0.0.1:31337/';

export const httpHost = host;
export const wsHost = host.replace('http', 'ws');

export const logout = () =>
	fetch(new URL('/auth', httpHost).toString(), {
		method: 'DELETE',
		credentials: 'include'
	}).then(() => {
		localStorage.removeItem('user-id');
	});

export const updateUser = (id: string, fields: Partial<{ password: string }>) =>
	fetch(new URL(`/users/${id}`, httpHost).toString(), {
		method: 'PATCH',
		credentials: 'include',
		body: JSON.stringify(fields)
	});
