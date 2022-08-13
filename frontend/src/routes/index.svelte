<script lang="ts">
	import { session } from '$app/stores';

	let username = '';
	let password = '';
	let error: string | null = null;

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

{#if $session.token}
	<a href="/lists">Lists</a>
{:else}
	<form>
		<div>
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

		<button on:click|preventDefault={login} disabled={!username || !password}>login</button>
		<button on:click|preventDefault={signup} disabled={!username || !password}>signup</button>
	</form>
	{#if error}
		<div>{error}</div>
	{/if}
{/if}
