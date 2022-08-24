<script lang="ts">
	import { useList } from '$lib/lists';
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

	$: list = $page.params.id ? useList($page.params.id) : undefined;
</script>

<svelte:head>
	{#if !list}
		<title>Lists</title>
	{:else if $list.isLoading === false}
		<title>{$list.title}</title>
	{/if}
</svelte:head>

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

<ul class="p-2 my-4 flex gap-2 bg-yellow-100 rounded-md border-2 border-black">
	{#if !list}
		<li><a class="underline" href="/lists/">lists</a></li>
	{:else if $list.isLoading}
		<li><a class="underline" href="/lists/">lists</a></li>
		<li>></li>
		<li>...</li>
	{:else if $list.isLoading === false}
		<li><a class="underline" href="/lists/">lists</a></li>
		<li>></li>
		<li><a class="underline" href="/lists/{$list.id}">{$list.title}</a></li>
	{/if}
</ul>

<slot />
