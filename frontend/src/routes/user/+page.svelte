<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth, useClient } from '$lib/logux';
	import { updateUser, useUser } from '$lib/users';
	import { logout as sendLogout, updateUser as sendUpdateUser } from '$lib/api';

	const auth = useAuth();
	const user = useUser($auth.userId);
	const client = useClient();

	let form: HTMLFormElement;
	let passwordInput: HTMLInputElement;
	const update = async () => {
		const data = new FormData(form);
		const username = data.get('username') as string;
		if (username && username.length > 0 && $user.isLoading === false && $user.name !== username)
			await updateUser(client, $user.id, {
				name: username
			});

		const password = data.get('password') as string;
		if (password && password.length !== 0)
			await sendUpdateUser($user.id, { password })
				.then(() => (passwordInput.value = ''))
				.catch(console.error);
	};

	const logout = () =>
		sendLogout()
			.then(() => {
				client.changeUser('anonymous');
				goto('/');
			})
			.catch(console.error);
</script>

<svelte:head>
	<title>User</title>
</svelte:head>

<header class="flex gap-6 pb-3 w-full justify-end">
	<button on:click|preventDefault={logout} class="underline">logout</button>
</header>

<div class="grid gap-6">
	<p>update your profile:</p>
	{#if $user.isLoading === false}
		<form class="flex flex-col gap-2 items-end" on:submit|preventDefault={update} bind:this={form}>
			<fieldset class="grid grid-cols-2 gap-1">
				<label for="username">username</label>
				<input
					id="username"
					name="username"
					type="text"
					placeholder="username"
					value={$user.name}
					class="border-2"
				/>

				<label for="password">password</label>
				<input
					bind:this={passwordInput}
					id="password"
					name="password"
					type="password"
					placeholder="new password"
					class="border-2"
				/>
			</fieldset>
			<button type="submit" class="underline">update</button>
		</form>
	{:else}
		loading...
	{/if}
</div>
