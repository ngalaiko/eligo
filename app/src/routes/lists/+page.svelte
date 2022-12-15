<script lang="ts">
	import { Button, Distance, List } from '$lib/components';
	import IconPlus from '$lib/assets/IconPlus.svelte';
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { notDeleted, merge } from '$lib';

	export let data: PageData;

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

<figure class="flex flex-col min-h-0 flex-1 gap-2">
	<figcaption class="flex justify-between items-center">
		<span class="font-semibold text-2xl">lists</span>
	</figcaption>

	<form
		method="POST"
		action="?/create"
		class="flex items-center gap-1 border-2 px-2 py-1 rounded-2xl"
		use:enhance
	>
		<Button type="submit">
			<IconPlus />
		</Button>

		<fieldset class="w-full">
			<input
				type="text"
				placeholder="new list"
				class="bg-inherit placeholder:text-foreground-4 font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden w-full focus:ring-none focus:outline-none"
				name="title"
				required
			/>
		</fieldset>
	</form>

	<List items={$lists} let:item={list}>
		<a href="/lists/{list.id}/pick/">
			<figure id={list.id} class="border-2 px-2 py-1 rounded-2xl hover:bg-gray-100">
				<h3 class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden">
					{list.title}
				</h3>

				<figcaption class="flex gap-1 opacity-50 text-sm">
					<b>{userName(list.userId)}</b>
					created
					<Distance to={list.createTime} />
				</figcaption>
			</figure>
		</a>
	</List>
</figure>
