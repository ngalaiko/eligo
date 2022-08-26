<script lang="ts">
	import { compareDesc } from 'date-fns';
	import { Card } from '$lib/lists';
	import { useLists } from '$lib/lists';

	const lists = useLists();
</script>

{#if $lists.isLoading === false}
	<ul class="grid grid-cols-1 gap-2">
		{#each $lists.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
			{#if list.isLoading === false}
				<li>
					<a href="/lists/{list.id}/pick/">
						<Card {list} />
					</a>
				</li>
			{/if}
		{/each}
	</ul>
{/if}
