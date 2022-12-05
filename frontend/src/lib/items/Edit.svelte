<script lang="ts">
	import type { Item } from '@eligo/protocol';
	import { ws } from '$lib/api';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { createEventDispatcher } from 'svelte';

	export let item: Item;

	const dispatch = createEventDispatcher();

	const onUpdateClicked = async () => {
		await ws.items.update({
			id: item.id,
			text: text,
			coordinates:
				coordinates && coordinates.length > 0 ? coordinates.split(',').map(parseFloat) : null,
			url: url && url.length > 0 ? url : null
		});
		emitClose();
	};

	const emitClose = () => {
		dispatch('close');
	};

	let text = item.text;
	let url = item.url;
	let coordinates = item.coordinates;
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

					<label for="url">url</label>
					<input id="url" type="text" class="col-span-2" bind:value={url} />

					<label for="coordinates">coordinates</label>
					<input id="coordinates" type="text" class="col-span-2" bind:value={coordinates} />
				</fieldset>

				<button type="submit" class="underline">save</button>
			</form>
		</div>
	</figure>
</div>
