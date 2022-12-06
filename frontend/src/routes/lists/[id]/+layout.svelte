<script lang="ts">
	import { InviteLink } from '$lib/memberships';
	import { page } from '$app/stores';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { derived } from 'svelte/store';
	import type { LayoutData } from './$types';
	import { ws } from '$lib/api';
	import { beforeNavigate } from '$app/navigation';
	import { horizontalSlide } from '$lib';

	export let data: LayoutData;

	const list = derived(ws.lists.list, (lists) => lists.find(({ id }) => id === data.listId));

	let mapEnabled = false;
	ws.items.list.subscribe(
		(items) =>
			(mapEnabled = items.some(
				(item) => item.listId === data.listId && item.coordinates !== undefined
			))
	);

	$: links = [
		{ href: `/lists/${$list?.id}/pick`, name: 'pick' },
		{ href: `/lists/${$list?.id}/items`, name: 'items' },
		{ href: `/lists/${$list?.id}/history`, name: 'history' },
		{ href: `/lists/${$list?.id}/map`, name: 'map', disabled: !mapEnabled }
	];

	let direction: 'left' | 'right' | undefined;
	let hey;
	beforeNavigate(({ from, to }) => {
		hey = to;
		const fromIndex = links.findIndex((link) => from.url.pathname.startsWith(link.href));
		const toIndex = links.findIndex((link) => to.url.pathname.startsWith(link.href));
		if (toIndex > -1 && fromIndex > -1) direction = fromIndex - toIndex > 0 ? 'right' : 'left';
	});
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
			{#each links as { href, name, disabled }}
				<a
					class:pointer-events-none={disabled}
					class:cursor-not-allowed={disabled}
					class:opacity-50={disabled}
					class:font-bold={$page.url.pathname.startsWith(href)}
					{href}>{name}</a
				>
			{/each}
		</nav>
	{/if}

	<div class="flex flex-col relative w-full h-full">
		{#if direction}
			{#key data.key}
				<div
					id="animation"
					in:horizontalSlide|local={{
						duration: 150,
						direction: direction === 'right' ? 'left' : 'right'
					}}
					out:horizontalSlide|local={{ duration: 150, direction }}
					class="flex flex-col absolute w-full h-full"
				>
					<slot />
				</div>
			{/key}
		{:else}
			<slot />
		{/if}
	</div>
</figure>
