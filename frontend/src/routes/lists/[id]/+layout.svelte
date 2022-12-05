<script lang="ts">
	import { InviteLink } from '$lib/memberships';
	import { page } from '$app/stores';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { derived } from 'svelte/store';
	import type { LayoutData } from './$types';
	import { ws } from '$lib/api';

	export let data: LayoutData;

	const list = derived(ws.lists.list, (lists) => lists.find(({ id }) => id === data.listId));
	const mapEnabled = derived(ws.items.list, (items) =>
		items.some((item) => item.listId === data.listId && item.coordinates !== undefined)
	);
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
				class:font-bold={$page.url.pathname.startsWith(`/lists/${$list.id}/pick`)}
				href="/lists/{$list.id}/pick">pick</a
			>
			<a
				class:font-bold={$page.url.pathname.startsWith(`/lists/${$list.id}/items`)}
				href="/lists/{$list.id}/items">items</a
			>
			<a
				class:font-bold={$page.url.pathname.startsWith(`/lists/${$list.id}/history`)}
				href="/lists/{$list.id}/history">history</a
			>
			<a
				class:pointer-events-none={!$mapEnabled}
				class:opacity-50={!$mapEnabled}
				class:font-bold={$page.url.pathname.startsWith(`/lists/${$list.id}/map`)}
				href="/lists/{$list.id}/map">map</a
			>
		</nav>
	{/if}

	<slot />
</figure>
