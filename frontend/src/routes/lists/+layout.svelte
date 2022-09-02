<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { logout as sendLogout } from '$lib/api';
	import { useAuth, useClient } from '$lib/logux';
	import { onMount } from 'svelte';

	const client = useClient();

	const logout = () =>
		sendLogout()
			.then(() => {
				client.changeUser('anonymous');
				goto('/');
			})
			.then(() => {
				localStorage.removeItem('user-id');
			})
			.catch(console.error);

	const auth = useAuth();

	onMount(async () => {
		await client.node.waitFor('disconnected');
		if (browser && !$auth.isAuthenticated && $page.url.pathname !== '/')
			goto('/?redirect=' + encodeURIComponent($page.url.pathname));
	});
</script>

<header class="flex gap-6 pb-3 w-full justify-end">
	{#if $auth.isAuthenticated}
		<a class="underline" href="/settings/">settings</a>
		<button on:click|preventDefault={logout} class="underline">logout</button>
	{/if}
</header>

<slot />
