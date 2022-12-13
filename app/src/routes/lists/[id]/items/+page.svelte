<script lang="ts">
	import { getWeights, type Item } from '@eligo/protocol';
	import { enhance } from '$app/forms';
	import { derived } from 'svelte/store';
	import type { PageData } from './$types';
	import { ws } from '$lib/api';
	import { merge, notDeleted } from '$lib';
	import { Button, Distance, List } from '$lib/components';
	import { IconArrowBigUpLine, IconPlus } from '$lib/assets';

	export let data: PageData;

	$: items = derived(ws.items.list, (items) =>
		merge(items, data.items)
			.filter(({ listId }) => listId === data.list.id)
			.filter(notDeleted)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: boosts = derived(ws.boosts.list, (boosts) =>
		merge(boosts, data.boosts)
			.filter(({ listId }) => listId === data.list.id)
			.filter(notDeleted)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: picks = derived(ws.picks.list, (picks) =>
		merge(picks, data.picks)
			.filter(({ listId }) => listId === data.list.id)
			.filter(notDeleted)
			.sort((a, b) => b.createTime - a.createTime)
	);

	$: chances = derived([items, picks, boosts], ([items, picks, boosts]) => {
		const weights = getWeights(items, picks, boosts);
		const weightsSum = Object.values(weights).reduce((a, b) => a + b, 0);
		return Object.fromEntries(
			Object.entries(weights).map(([itemId, weight]) => [itemId, weight / weightsSum])
		);
	});

	$: users = derived(ws.users.list, (users) => merge(users, data.users).filter(notDeleted));

	const byAlphabet = (a: Item, b: Item) => a.text.localeCompare(b.text);
	const byChance = (a: Item, b: Item) => $chances[b.id] - $chances[a.id];

	const userName = (id: string) => {
		const user = $users.find((user) => user.id === id);
		return user?.id === data.user.id ? 'you' : user?.displayName ?? user?.name ?? '';
	};
</script>

<div class="flex flex-col gap-2 h-full">
	<form
		method="POST"
		action="?/create"
		class="flex gap-2 border-2 px-2 py-1 rounded-2xl items-center"
		use:enhance
	>
		<Button type="submit">
			<IconPlus />
		</Button>

		<fieldset class="w-full">
			<input
				type="text"
				name="text"
				class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden w-full focus:ring-none focus:outline-none"
				placeholder="new item"
				required
			/>
		</fieldset>
	</form>

	<List items={$items.sort(byAlphabet).sort(byChance)} let:item>
		{@const chance = $chances[item.id]}
		{@const chancePercentage = (chance * 100).toFixed(0)}
		{@const uname = userName(item.userId)}
		<div
			id={item.id}
			class="border-2 px-2 rounded-2xl bg-gray-300"
			style:background="linear-gradient(90deg, var(--color-gray-300) {chancePercentage}%,
			var(--color-white) {chance}%)"
		>
			<div style:width="{chance}%" class="h-2 bg-500 relative" />
			<div class="font-semibold text-lg flex justify-between">
				<p class="overflow-ellipsis">{item.text}</p>
				<figure class="text-sm flex items-center gap-1">
					<figcaption>{(chance * 100).toFixed(2)}%</figcaption>
					<form
						method="POST"
						use:enhance
						action="/lists/{data.list.id}/items/{item.id}/boosts?/create&redirect=%2Flists%2F{data
							.list.id}%2Fitems%2F"
					>
						<Button type="submit">
							<IconArrowBigUpLine />
						</Button>
					</form>
				</figure>
			</div>

			<div class="flex gap-1 opacity-50 text-sm">
				<b>{uname}</b>
				created
				<Distance to={item.createTime} />
				|
				<form
					method="POST"
					use:enhance={({ cancel }) => {
						if (!confirm(`are you sure you want to delete ${item.text}?`)) {
							cancel();
							return;
						}
					}}
					action="/lists/{data.list.id}/items/{item.id}?/delete&redirect=%2Flists%2F{data.list
						.id}%2Fitems%2F"
				>
					<button type="submit" class="hover:underline">delete</button>
				</form>
			</div>
		</div>
	</List>
</div>