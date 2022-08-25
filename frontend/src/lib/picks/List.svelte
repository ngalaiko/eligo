<script lang="ts">
	import { usePicks, Card, Button } from '$lib/picks';
	import { compareDesc } from 'date-fns';

	export let listId: string;
	const picks = usePicks({ listId });
</script>

{#if $picks.isLoading === false}
	<ul class="grid grid-cols-1 gap-2">
		<li>
			<Button {listId} />
		</li>
		{#each $picks.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as pick}
			{#if pick.isLoading == false}
				<li><Card {pick} /></li>
			{/if}
		{/each}
	</ul>
{/if}
