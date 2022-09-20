<script lang="ts">
	import { list } from '$lib/items';

	export let itemId: string;
	$: item = $list.find(({ id }) => id === itemId);
</script>

<span
	class="whitespace-nowrap overflow-ellipsis overflow-hidden"
	class:line-through={!!item.deleteTime}
>
	<b>{item.text}</b>
</span>
