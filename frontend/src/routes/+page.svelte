<script lang="ts">
	import { goto } from '$app/navigation';

	import { httpHost } from '$lib/api';
	import { useAuth, useClient } from '$lib/logux';

	let username = '';
	let password = '';
	let error: string | null = null;

	const client = useClient();

	const auth = useAuth();

	const signup = async () => {
		error = null;
		await fetch(new URL('/users', httpHost).toString(), {
			method: 'POST',
			body: JSON.stringify({ name: username, password }),
			credentials: 'include'
		}).then((res) =>
			res.status === 200
				? res.json().then(({ id }) => {
						client.changeUser(id);
						client.start();
						localStorage.setItem('user-id', id);
						goto('/lists/');
						username = '';
						password = '';
				  })
				: res.text().then((text) => {
						console.error(text);
						error = text;
				  })
		);
	};

	const login = async () => {
		error = null;
		await fetch(new URL('/auth', httpHost).toString(), {
			method: 'POST',
			body: JSON.stringify({ name: username, password }),
			credentials: 'include'
		}).then((res) =>
			res.status === 200
				? res.json().then(({ id }) => {
						client.changeUser(id);
						client.start();
						localStorage.setItem('user-id', id);
						goto('/lists/');
						username = '';
						password = '';
				  })
				: res.text().then((text) => {
						console.error(text);
						error = text;
				  })
		);
	};
</script>

<div class="flex justify-around">
	{#if $auth.isAuthenticated}
		<a href="/lists">Lists -></a>
	{:else}
		<form class="flex flex-col gap-2 justify-around">
			<div class="grid gap-1">
				<input
					id="username"
					name="username"
					type="text"
					placeholder="username"
					bind:value={username}
				/>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="password"
					bind:value={password}
				/>
			</div>

			<div>
				<button class="underline" on:click|preventDefault={login} disabled={!username || !password}
					>login</button
				>
				<button class="underline" on:click|preventDefault={signup} disabled={!username || !password}
					>signup</button
				>
			</div>

			{#if error}
				<div class="bg-red-300 p-2 rounded">{error}</div>
			{/if}
		</form>
	{/if}
</div>
