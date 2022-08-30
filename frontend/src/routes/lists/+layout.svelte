<script lang="ts">
	import { Single as User } from '$lib/users';
	import { goto } from '$app/navigation';
	import { logout as sendLogout } from '$lib/api';
	import { useAuth, useClient } from '$lib/logux';

	const client = useClient();

	const logout = () =>
		sendLogout()
			.then(() => {
				client.changeUser('anonymous');
				goto('/');
			})
			.catch(console.error);

	const auth = useAuth();
</script>

<header class="flex gap-6 pb-3 w-full justify-end">
	{#if $auth.isAuthenticated}
		<a class="underline" href="/user">
			<User userId={$auth.userId} replaceSelf={false} />
		</a>
		<button on:click|preventDefault={logout} class="underline">logout</button>
	{/if}
</header>

<slot />
