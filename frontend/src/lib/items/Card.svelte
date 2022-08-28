<script lang="ts">
	import { Single as User } from '$lib/users';
	import { Button as Boost } from '$lib/boosts';
	import type { Item } from '@eligo/protocol';
	import { Distance } from '$lib/time';

	export let item: Item & { id: string };
	export let chance: number;

	$: chancePercentage = (chance * 100).toFixed(0);
</script>

<div
	id={item.id}
	class="border-2 px-2 py-1 rounded-2xl bg-gray-300"
	style:background="linear-gradient(90deg, var(--color-gray-300) {chancePercentage}%,
	var(--color-white) {chancePercentage}%)"
>
	<div style:width="{chancePercentage}%" class="h-2 bg--500 relative z-1" />
	<div
		class="font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden flex justify-between"
	>
		<p>{item.text}</p>
		<figure class="text-sm flex items-center gap-1">
			<figcaption>{(chance * 100).toFixed(2)}%</figcaption>
			<Boost itemId={item.id} listId={item.listId} />
		</figure>
	</div>

	<div class="flex gap-1 opacity-50 text-sm">
		created
		<Distance to={item.createTime} />
		by
		<User userId={item.userId} />
	</div>
</div>
