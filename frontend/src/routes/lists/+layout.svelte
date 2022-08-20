<script lang="ts">
	import { useList } from '$lib/lists';
	import { Card as UserCard } from '$lib/users';
	import { session, page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';

	const logout = async () => {
		await fetch('/api/auth', {
			method: 'DELETE',
			credentials: 'include'
		})
			.then(() => {
				$session = {};
				goto('/');
			})
			.catch(console.error);
	};

	session.subscribe((session) => {
		if (browser && !session.user && $page.url.pathname !== '/')
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
	{#if $session.user}
		<span class="inline-flex gap-1">
			you are logged in as
			<b>
				<UserCard user={$session.user} replaceSelf={false} />
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
