<script lang="ts">
	import { Card, Form } from '$lib/lists';
	import { compareDesc } from 'date-fns';
	import { useLists } from '$lib/lists';

	const lists = useLists();
</script>

<svelte:head>
	<title>Lists</title>
</svelte:head>

{#await lists.loading}
	loading...
{:then}
	<figure class="grid gap-2">
		<figcaption class="text-2xl font-semibold">Lists</figcaption>

		<Form />
		<ul class="grid grid-cols-1 gap-2">
			{#each $lists.list
				.filter(({ isLoading }) => !isLoading)
				.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
				<li>
					<a href="/lists/{list.id}/pick/">
						<Card {list} />
					</a>
				</li>
			{/each}
		</ul>
	</figure>
{/await}
