<script lang="ts">
	import { Card, Form } from '$lib/lists';
	import { compareDesc } from 'date-fns';
	import { useLists } from '$lib/lists';

	const lists = useLists();
</script>

<figure class="grid gap-4">
	<figcaption class="text-2xl font-semibold">Lists</figcaption>

	<Form />
	<ul class="grid grid-cols-1 gap-2">
		{#each $lists.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
			<li>
				<a href="/lists/{list.id}/pick/">
					<Card {list} />
				</a>
			</li>
		{/each}
	</ul>
</figure>
