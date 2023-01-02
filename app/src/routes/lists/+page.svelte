<script lang="ts">
	import { Button, ConnectedIndicator, Distance, List } from '$lib/components';
	import IconPlus from '$lib/assets/IconPlus.svelte';
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import { notDeleted, merge } from '$lib';

	export let data: PageData;
	export let form: ActionData;

	$: isCreating = !form?.list && $page.url.searchParams.get('creating') === 'true';

	$: users = derived(ws.users.list, (users) => merge(users, data.users).filter(notDeleted));
	$: memberships = derived(ws.memberships.list, (memberships) =>
		merge(memberships, data.memberships).filter(notDeleted)
	);

	$: lists = derived([ws.lists.list, memberships], ([lists, memberships]) =>
		merge(lists, data.lists)
			.filter(notDeleted)
			.filter((list) => {
				const isOwner = list.userId === data.user.id;
				const isMember = memberships.some((membership) => membership.listId === list.id);
				return isOwner || isMember;
			})
			.sort((a, b) => b.createTime - a.createTime)
	);

	const userName = (id: string) => {
		const user = $users.find((user) => user.id === id);
		return user?.id === data.user.id ? 'you' : user?.displayName ?? user?.name ?? '';
	};
</script>

<svelte:head>
	<title>lists</title>
</svelte:head>

<figure class="flex flex-col gap-1 h-full">
	<figcaption class="flex justify-between items-center">
		<span class="font-semibold text-xl">lists</span>
		<a href="?creating={!isCreating}">
			<Button highlight={isCreating}>
				<IconPlus />
			</Button>
		</a>
	</figcaption>

	{#if isCreating}
		<form method="POST" action="?/create" class="flex items-center gap-1" use:enhance>
			<fieldset class="w-full">
				<input
					type="text"
					placeholder="new list"
					class="bg-inherit placeholder:text-foreground-4 whitespace-nowrap text-ellipsis overflow-hidden w-full focus:ring-none focus:outline-none"
					name="title"
					required
				/>
			</fieldset>

			<input type="submit" class="underline" value="create" />
		</form>
	{/if}

	<List items={$lists} let:item={list}>
		<a href="/lists/{list.id}/pick/" data-sveltekit-preload-data="hover">
			<figure id={list.id} class="my-1 transition hover:scale-105">
				<h3 class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden">
					{list.title}
				</h3>

				<figcaption class="flex gap-1 opacity-50 text-sm">
					<div class="flex gap-1 items-center">
						<ConnectedIndicator userId={list.userId} />
						<b>{userName(list.userId)}</b>
					</div>
					created
					<Distance to={list.createTime} />
				</figcaption>
			</figure>
		</a>
	</List>
</figure>
