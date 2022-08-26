<script lang="ts">
	import { Single as User } from '$lib/users';
	import { goto } from '$app/navigation';
	import { httpHost } from '$lib/api';
	import { useAuth, useClient } from '$lib/logux';

	const client = useClient();

	const logout = async () => {
		await fetch(new URL('/auth', httpHost).toString(), {
			method: 'DELETE',
			credentials: 'include'
		})
			.then(() => {
				client.changeUser('anonymous');
				localStorage.removeItem('user-id');
				goto('/');
			})
			.catch(console.error);
	};

	const auth = useAuth();
</script>

<header class="inline-flex gap-6 py-3 w-full justify-between">
	{#if $auth.isAuthenticated}
		<span class="inline-flex gap-1">
			you are logged in as
			<User userId={$auth.userId} />
		</span>
		<button on:click|preventDefault={logout} class="underline">logout</button>
	{/if}
</header>

<slot />
