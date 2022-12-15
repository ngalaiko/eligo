<script lang="ts">
	import { page } from '$app/stores';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { derived } from 'svelte/store';
	import type { LayoutData } from './$types';
	import { ws } from '$lib/api';
	import { enhance } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { horizontalSlide, merge, notDeleted } from '$lib';
	import { Dropdown } from '$lib/components';

	export let data: LayoutData;

	$: list = derived(
		ws.lists.list,
		(lists) => lists.find((list) => list.id === data.list.id) ?? data.list
	);

	$: memberships = derived(ws.memberships.list, (memberships) =>
		merge(memberships, data.memberships).filter(notDeleted)
	);

	$: isMapEnabled = derived(ws.items.list, (items) =>
		merge(items, data.items)
			.filter(notDeleted)
			.some(
				({ coordinates }) =>
					coordinates !== undefined && Array.isArray(coordinates) && coordinates.length > 0
			)
	);

	$: links = derived(isMapEnabled, (isMapEnabled) => [
		{ href: `/lists/${$list.id}/pick`, name: 'pick' },
		{ href: `/lists/${$list.id}/items`, name: 'items' },
		{ href: `/lists/${$list.id}/history`, name: 'history' },
		{ href: `/lists/${$list.id}/members`, name: 'members' },
		{ href: `/lists/${$list.id}/map`, name: 'map', disabled: !isMapEnabled }
	]);

	$: options = derived([list, memberships], ([list, memberships]) => {
		const isOwner = list.userId === data.user.id;
		const membership = memberships.find(({ userId }) => userId == data.user.id);

		return isOwner
			? [
					{
						action: `/lists/${list.id}?/delete&redirect=%2Flists%2F`,
						confirm: `are you sure you want to delete ${list.title}?`,
						text: 'delete'
					}
			  ]
			: !!membership
			? [
					{
						action: `/lists/${list.id}/members/${membership.id}?/delete&redirect=%2Flists%2F`,
						confirm: `are you sure you want to leave ${list.title}?`,
						text: 'leave'
					}
			  ]
			: [];
	});

	let direction: 'left' | 'right' | undefined;
	beforeNavigate(({ from, to }) => {
		const fromIndex = $links.findIndex((link) => from?.url.pathname.startsWith(link.href));
		const toIndex = $links.findIndex((link) => to?.url.pathname.startsWith(link.href));
		if (toIndex > -1 && fromIndex > -1) direction = fromIndex - toIndex > 0 ? 'right' : 'left';
	});
</script>

<svelte:head>
	<title>{$list.title}</title>
</svelte:head>

<figure class="flex flex-col min-h-0 flex-1 gap-2">
	<figcaption>
		<a
			href="/lists/"
			class="hover:opacity-70 flex items-center"
			data-sveltekit-preload-data="hover"
		>
			<IconChevronLeft class="w-4 h-4 -ml-2" />
			<span>lists</span>
		</a>
		<div class="flex justify-between items-center">
			<h2 class="whitespace-nowrap text-2xl font-semibold">{$list.title}</h2>

			<Dropdown options={$options} let:option>
				<form
					method="POST"
					action={option.action}
					use:enhance={({ cancel }) => {
						if (!!option.confirm && !confirm(option.confirm)) {
							cancel();
							return;
						}
					}}
				>
					<button type="submit" class="underline whitespace-nowrap">{option.text}</button>
				</form>
			</Dropdown>
		</div>
	</figcaption>

	<nav class="flex gap-4 w-full border-b-2">
		{#each $links as { href, name, disabled }}
			<a
				class:pointer-events-none={disabled}
				class:cursor-not-allowed={disabled}
				class:opacity-50={disabled}
				class:font-bold={$page.url.pathname.startsWith(href)}
				data-sveltekit-preload-data="hover"
				{href}>{name}</a
			>
		{/each}
	</nav>

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
