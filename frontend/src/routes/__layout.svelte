<script lang="ts">
	import { Context } from '$lib/logux';
	import { session } from '$app/stores';

	let name = '';
	let password = '';
	let error: string | null = null;

	const logout = async () => {
		error = null;
		await fetch('/api/auth', {
			method: 'DELETE',
			credentials: 'include'
		})
			.then(() => {
				$session = {};
			})
			.catch((err) => {
				console.error(err.message);
				error = 'Something went wrong';
			});
	};

	const signup = async () => {
		error = null;
		await fetch('/api/users', {
			method: 'POST',
			body: JSON.stringify({ name, password }),
			credentials: 'include'
		}).then((res) =>
			res.status === 200
				? res.json().then(({ id, name, token }) => {
						name = '';
						password = '';
						$session = {
							user: { id, name },
							token
						};
				  })
				: res.text().then((text) => {
						console.error(text);
						error = text;
				  })
		);
	};

	const login = async () => {
		error = null;
		await fetch('/api/auth', {
			method: 'POST',
			body: JSON.stringify({ name, password }),
			credentials: 'include'
		}).then((res) =>
			res.status === 200
				? res.json().then(({ id, name, token }) => {
						name = '';
						password = '';
						$session = {
							user: { id, name },
							token
						};
				  })
				: res.text().then((text) => {
						console.error(text);
						error = text;
				  })
		);
	};
</script>

<Context>
	<header>
		{#if $session.user}
			<button on:click|preventDefault={logout}>logout</button>
		{:else}
			<form>
				<input name="username" type="text" placeholder="username" bind:value={name} />
				<input id="password" type="password" placeholder="password" bind:value={password} />
				<button on:click|preventDefault={login} disabled={!name || !password}>login</button>
				<button on:click|preventDefault={signup} disabled={!name || !password}>signup</button>
			</form>
		{/if}
		{#if error}
			<div>{error}</div>
		{/if}
	</header>
	<main>
		<slot />
	</main>
</Context>
