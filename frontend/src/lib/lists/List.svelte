<script lang="ts">
	import { compareDesc } from 'date-fns';
	import { Card, Form } from '$lib/lists';
	import { useLists } from '$lib/lists';

	const lists = useLists();
</script>

{#if $lists.isLoading === false}
	<ul class="grid grid-cols-1 gap-2">
		<li>
			<Form />
		</li>
		{#each $lists.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
			{#if list.isLoading === false}
				<li>
					<a href="/lists/{list.id}/items/">
						<Card {list} />
					</a>
				</li>
			{/if}
		{/each}
	</ul>
{/if}
