<script lang="ts">
	import { list as lists } from '$lib/lists';
	import { InviteLink } from '$lib/memberships';
	import { page } from '$app/stores';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { derived } from 'svelte/store';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	const list = derived(lists, (lists) => lists.find(({ id }) => id === data.listId));
</script>

<svelte:head>
	<title>{$list?.title}</title>
</svelte:head>

<figure class="flex flex-col min-h-0 flex-1 gap-2">
	{#if $list}
		<figcaption>
			<a href="/lists/" class="hover:opacity-70 flex items-center">
				<IconChevronLeft class="w-4 h-4 -ml-2" />
				<span>lists</span>
			</a>
			<h2 class="whitespace-nowrap text-2xl font-semibold">{$list?.title}</h2>
			<InviteLink list={$list} />
		</figcaption>

		<nav class="flex gap-4 w-full border-b-2">
			<a
				class:font-bold={$page.url.pathname === `/lists/${$list.id}/pick`}
				href="/lists/{$list.id}/pick/">pick</a
			>
			<a
				class:font-bold={$page.url.pathname === `/lists/${$list.id}/items`}
				href="/lists/{$list.id}/items/">items</a
			>
			<a
				class:font-bold={$page.url.pathname === `/lists/${$list.id}/history`}
				href="/lists/{$list.id}/history/">history</a
			>
		</nav>
	{/if}

	<slot />
</figure>
