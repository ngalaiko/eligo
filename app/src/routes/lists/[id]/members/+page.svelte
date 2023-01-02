<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { merge, notDeleted } from '$lib';
	import { ws } from '$lib/api';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';
	import { ConnectedIndicator, List } from '$lib/components';
	import { nanoid } from 'nanoid';

	export let data: PageData;

	$: list = derived(
		ws.lists.list,
		(lists) => lists.find((list) => list.id === data.list.id) ?? data.list
	);

	$: memberships = derived([ws.memberships.list, list], ([memberships, list]) =>
		merge(memberships, data.memberships, [
			{ id: 'owner', userId: list.userId, listId: list.id, createTime: list.createTime }
		])
			.filter(notDeleted)
			.filter(({ listId }) => listId === data.list.id)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: users = derived(ws.users.list, (users) => merge(users, data.users).filter(notDeleted));

	const userName = (id: string) => {
		const user = $users.find((user) => user.id === id);
		return user?.id === data.user.id ? 'you' : user?.displayName ?? user?.name ?? '';
	};
</script>

<figure class="flex flex-col gap-2">
	<List items={$memberships} let:item={membership}>
		<span class="flex gap-1 items-center">
			<ConnectedIndicator userId={membership.userId} />
			<b>{userName(membership.userId)}</b>
		</span>
	</List>

	<figcaption class="pt-2">
		<form
			method="POST"
			action="/lists/{$list.id}?/update&redirect={encodeURIComponent($page.url.pathname)}"
			use:enhance
			class="flex flex-col align-left opacity-50"
		>
			{#if $list.invitatationId}
				<input hidden name="invitation-id" />
				<p>to invite more people, send them this link:</p>
				<span class="underline">{$page.url.origin}/join/{$list.invitatationId}</span>
				<span>
					or
					<button type="submit" class="underline text-left">disable invitation link</button>
				</span>
			{:else}
				<input hidden name="invitation-id" value={nanoid()} />
				<button type="submit" class="underline text-left">create invitation link</button>
			{/if}
		</form>
	</figcaption>
</figure>
