<script lang="ts">
	import type { PageData } from './$types';
	import { useList } from '$lib/lists';
	import { InviteLink } from '$lib/memberships';
	import { page } from '$app/stores';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';

	export let data: PageData;

	const list = useList(data.listId);
</script>

<svelte:head>
	{#if $list.isLoading === false}
		<title>{$list.title}</title>
	{:else}
		<title>...</title>
	{/if}
</svelte:head>

<figure class="grid gap-2">
	{#if $list.isLoading}
		loading...
	{:else if $list.isLoading === false}
		<figcaption class="my-4 gap-6 justify-between items-baseline">
			<a href="/lists/" class="hover:opacity-70 flex items-center"
				><IconChevronLeft class="w-5 h-5" />lists</a
			>
			<h2 class="whitespace-nowrap  text-2xl font-semibold">{$list.title}</h2>
			<InviteLink list={$list} />
		</figcaption>
		<nav class="flex gap-4 w-full border-b-2">
			<a
				class:font-bold={$page.url.pathname === `/lists/${$list.id}/items/`}
				href="/lists/{$list.id}/items/">items</a
			>
			<a
				class:font-bold={$page.url.pathname === `/lists/${$list.id}/picks/`}
				href="/lists/{$list.id}/picks/">picks</a
			>
		</nav>

		<slot />
	{/if}
</figure>
