<script lang="ts">
	import { Card as UserCard, useUser } from '$lib/users';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import { httpHost } from '$lib/api';
	import { useAuth, useClient } from '$lib/logux';
	import { onMount } from 'svelte';

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
	const user = useUser($auth.userId);

	onMount(async () => {
		await client.node.waitFor('disconnected');
		if (browser && !$auth.isAuthenticated && $page.url.pathname !== '/')
			goto('/?redirect=' + encodeURIComponent($page.url.href));
	});
</script>

<header class="inline-flex gap-6 pt-2 w-full justify-between">
	{#if $auth.isAuthenticated && $user.isLoading === false}
		<span class="inline-flex gap-1">
			you are logged in as
			<b>
				<UserCard user={$user} replaceSelf={false} />
			</b>
		</span>
		<button on:click|preventDefault={logout} class="underline">logout</button>
	{/if}
</header>

<slot />
