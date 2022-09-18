<script lang="ts">
	import { auth, connect, login, signup } from '$lib/api';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

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

	const onSignupClick = async () => {
		error = null;
		await signup({ name: username, password })
			.then((user) => {
				$auth.user = user;
				username = '';
				password = '';
				connect();
			})
			.catch((err) => (error = err.message));
	};

	const onLoginClick = async () => {
		error = null;
		await login({ name: username, password })
			.then((user) => {
				$auth.user = user;
				username = '';
				password = '';
				connect();
			})
			.catch((err) => (error = err.message));
	};

	auth.subscribe(({ user }) => {
		const nextUrl = $page.url.searchParams.get('redirect');
		if (browser && user) goto(nextUrl ?? '/lists/');
	});
</script>

<svelte:head>
	<title>eligo</title>
</svelte:head>

<div class="flex flex-col items-center gap-4 h-1/2 text-xl">
	{#if $auth.user}
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
					<button class="underline" on:click|preventDefault={onLoginClick} disabled={!isValid}
						>login</button
					>
				{:else if type === 'signup'}
					<button class="underline" on:click|preventDefault={onSignupClick} disabled={!isValid}
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
