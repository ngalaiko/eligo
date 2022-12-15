<script lang="ts">
	import { getWeights, type Item } from '@eligo/protocol';
	import { enhance } from '$app/forms';
	import { derived } from 'svelte/store';
	import type { PageData, ActionData } from './$types';
	import { ws } from '$lib/api';
	import { merge, notDeleted } from '$lib';
	import { Button, List } from '$lib/components';
	import { IconArrowBigUpLine, IconPlus, IconCircleMinus, IconCurrentLocation } from '$lib/assets';
	import { page } from '$app/stores';

	export let data: PageData;
	export let form: ActionData;

	$: isEditing = $page.url.searchParams.get('editing') === 'true';

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

	const byAlphabet = (a: Item, b: Item) => a.text.localeCompare(b.text);
	const byChance = (a: Item, b: Item) => $chances[b.id] - $chances[a.id];
</script>

<div class="flex flex-col  h-full">
	<div class="flex items-center gap-2">
		<form
			method="POST"
			action="?/create"
			class="flex flex-1 gap-2 py-1 rounded-2xl items-center"
			use:enhance
		>
			<Button type="submit">
				<IconPlus class="w-5 h-5" />
			</Button>

			<fieldset class="w-full">
				<input
					type="text"
					name="text"
					class="bg-inherit placeholder:text-foreground-4 whitespace-nowrap text-ellipsis overflow-hidden w-full focus:ring-none focus:outline-none"
					placeholder="new item"
					required
				/>
			</fieldset>
		</form>

		{#if $items.length > 0}
			{#if isEditing}
				<a href="?" class="underline w-[5ch] text-center">done</a>
			{:else}
				<a href="?editing=true" class="underline w-[5ch] text-center">edit</a>
			{/if}
		{/if}
	</div>

	<List items={$items.sort(byAlphabet).sort(byChance)} let:item>
		{@const chance = $chances[item.id]}
		{@const chancePercentage = (chance * 100).toFixed(0)}
		<div class="flex w-full items-center gap-1">
			<form
				method="POST"
				action="?/update"
				use:enhance={() =>
					({ update }) =>
						update({ reset: false })}
				disabled={!isEditing}
				class="flex-1 p-1 px-2 rounded-2xl bg-gray-300"
				style:background="linear-gradient(90deg, var(--background-2) {chancePercentage}%,
				var(--background-soft) {chancePercentage}%)"
			>
				<input type="text" hidden value={item.id} name="id" />
				<div class="flex items-center font-semibold text-lg flex justify-between">
					{#if isEditing}
						<input
							type="text"
							name="text"
							class="bg-transparent overflow-ellipsis"
							disabled={!isEditing}
							required
							value={item.text}
						/>
					{:else}
						<h3 class="bg-transparent overflow-ellipsis">{item.text}</h3>
					{/if}
					<figure class="text-sm flex items-center gap-2">
						<figcaption>{(chance * 100).toFixed(2)}%</figcaption>
						<form method="POST" use:enhance action="?/boost">
							<input type="text" hidden value={item.id} name="id" />
							<Button type="submit">
								<IconArrowBigUpLine />
							</Button>
						</form>
					</figure>
				</div>

				<footer class="flex gap-1 text-sm items-left -mt-1">
					{#if item.coordinates || isEditing}
						<div class="flex gap-1 items-center">
							<IconCurrentLocation class="w-4 h-4" />
							{#if isEditing}
								<input
									class:text-red={isEditing &&
										form?.success === false &&
										form?.item?.id === item.id &&
										form?.item?.coordinates === false}
									name="coordinates"
									disabled={!isEditing}
									class="bg-inherit placeholder:text-foreground-4"
									type="text"
									value={item.coordinates ?? []}
									placeholder="longtitude, langtitude"
								/>
							{:else}
								<span>{item.coordinates}</span>
							{/if}
						</div>
					{/if}
					{#if isEditing}
						|
						<button type="submit" class="underline">save</button>
					{/if}
				</footer>
			</form>

			{#if isEditing}
				<form
					action="?/delete"
					method="POST"
					use:enhance={({ cancel }) => {
						if (!confirm(`are you sure you want to delete ${item.text}?`)) {
							cancel();
							return;
						}
					}}
				>
					<input hidden type="text" name="id" value={item.id} />
					<Button type="submit">
						<IconCircleMinus class="fill-red stroke-background-soft w-8 h-8" />
					</Button>
				</form>
			{/if}
		</div>
	</List>
</div>
