<script lang="ts">
	import { Context } from '$lib/logux';
	import { session } from '$app/stores';

	let username = '';
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
			body: JSON.stringify({ name: username, password }),
			credentials: 'include'
		}).then((res) =>
			res.status === 200
				? res.json().then(({ id, name, token }) => {
						username = '';
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
			body: JSON.stringify({ name: username, password }),
			credentials: 'include'
		}).then((res) =>
			res.status === 200
				? res.json().then(({ id, name, token }) => {
						username = '';
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
		{#if $session.token}
			<div>
				{$session.user.name}
				<button on:click|preventDefault={logout}>logout</button>
			</div>
		{:else}
			<form>
				<input name="username" type="text" placeholder="username" bind:value={username} />
				<input id="password" type="password" placeholder="password" bind:value={password} />
				<button on:click|preventDefault={login} disabled={!username || !password}>login</button>
				<button on:click|preventDefault={signup} disabled={!username || !password}>signup</button>
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
