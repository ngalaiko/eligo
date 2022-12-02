<script lang="ts">
	import { Single as User } from '$lib/users';
	import { Button as Boost } from '$lib/boosts';
	import type { Item } from '@eligo/protocol';
	import { Distance } from '$lib/time';
	import { delete as deleteItem, update } from '$lib/items';
	import DoubleClickButton from '$lib/components/DoubleClickButton.svelte';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { createEventDispatcher } from 'svelte';

	export let item: Item;

	const dispatch = createEventDispatcher();

	const onUpdateClicked = async () => {
		await update({
			id: item.id,
			text: text
		});
		emitClose();
	};

	const emitClose = () => {
		dispatch('close');
	};

	let text = item.text;
</script>

<div id={item.id} class="border-2 px-2 py-1 rounded-2xl bg-gray-300">
	<figure class="flex flex-col flex-1 gap-2">
		<figcaption>
			<a href="#" on:click|preventDefault={emitClose} class="hover:opacity-70 flex items-center">
				<IconChevronLeft class="w-4 h-4 -ml-2" />
				<span>back</span>
			</a>
			<h2 class="whitespace-nowrap text-xl font-semibold">Updating: {item.text}</h2>
		</figcaption>

		<div class="flex flex-col gap-3">
			<form class="flex flex-col gap-2 items-end" on:submit|preventDefault={onUpdateClicked}>
				<fieldset class="grid grid-cols-3 gap-1  w-full">
					<label for="text">name</label>
					<input id="text" type="text" class="col-span-2" bind:value={text} />
				</fieldset>

				<button type="submit" class="underline">save</button>
			</form>
		</div>
	</figure>
</div>
