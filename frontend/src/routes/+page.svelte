<script lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { httpHost } from '$lib/api';
	import { useAuth, useClient } from '$lib/logux';
	import { onMount } from 'svelte';

	let username = '';
	let password = '';
	let passwordRepeat = '';
	let type: 'login' | 'signup' = 'login';
	let error: string | null = null;

	$: isValid =
		(type === 'signup' &&
			username.length > 0 &&
			password.length > 0 &&
			password === passwordRepeat) ||
		(type === 'login' && username.length > 0 && password.length > 0);

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
						username = '';
						password = '';
				  })
				: res.text().then((text) => {
						console.error(text);
						error = text;
				  })
		);
	};

	auth.subscribe(({ isAuthenticated }) => {
		const nextUrl = $page.url.searchParams.get('redirect');
		if (isAuthenticated) goto(nextUrl ?? '/lists/');
	});

	onMount(async () => {
		await client.node.waitFor('disconnected');
		if (browser && !$auth.isAuthenticated && $page.url.pathname !== '/')
			goto('/?redirect=' + encodeURIComponent($page.url.pathname));
	});
</script>

<div class="flex flex-col items-center gap-4 h-1/2 text-xl">
	{#if $auth.isAuthenticated}
		<a href="/lists/">lists -></a>
	{:else}
		<form class="flex flex-col gap-2 justify-around m-auto">
			<p class="text-red-600 opacity-0" class:opacity-100={error}>{error}</p>

			<fieldset class="grid gap-1">
				<input
					id="username"
					name="username"
					type="text"
					placeholder="username"
					bind:value={username}
					on:input={() => (error = null)}
				/>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="password"
					bind:value={password}
					on:input={() => (error = null)}
				/>
				{#if type === 'signup'}
					<input
						id="password-repeat"
						name="password-repeat"
						type="password"
						placeholder="repeat password"
						bind:value={passwordRepeat}
						on:input={() => (error = null)}
					/>
				{/if}
			</fieldset>

			<div>
				{#if type === 'login'}
					<button class="underline" on:click|preventDefault={login} disabled={!isValid}
						>login</button
					>
				{:else if type === 'signup'}
					<button class="underline" on:click|preventDefault={signup} disabled={!isValid}
						>signup</button
					>
				{/if}
			</div>

			<div>
				{#if type === 'login'}
					<button class="opacity-50 text-sm" on:click={() => (type = 'signup')}>
						don't have an account?
					</button>
				{:else if type === 'signup'}
					<button class="opacity-50 text-sm" on:click={() => (type = 'login')}>
						already have an account?
					</button>
				{/if}
			</div>
		</form>
	{/if}
</div>
