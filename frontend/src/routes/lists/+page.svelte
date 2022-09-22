<script lang="ts">
	import { Card, Form, list } from '$lib/lists';
	import { compareDesc } from 'date-fns';
</script>

<svelte:head>
	<title>Lists</title>
</svelte:head>

<figure class="grid gap-2">
	<figcaption class="text-2xl font-semibold">Lists</figcaption>

	<Form />
	<ul class="grid grid-cols-1 gap-2 -mr-3">
		{#each $list
			.filter(({ deleteTime }) => deleteTime === undefined)
			.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
			<li class="mr-3">
				<a href="/lists/{list.id}/pick/">
					<Card {list} />
				</a>
			</li>
		{/each}
	</ul>
</figure>
