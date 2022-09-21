<script lang="ts">
	import { Distance } from '$lib/time';
	import { Single as User } from '$lib/users';
	import type { List } from '@eligo/protocol';

	export let list: List & { id: string };
</script>

<div id={list.id} class="border-2 px-2 py-1 rounded-2xl hover:bg-yellow-100">
	<span class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden">
		{list.title}
	</span>

	<div class="flex gap-1 opacity-50 text-sm">
		<User userId={list.userId} />
		created
		<Distance to={list.createTime} />
	</div>
</div>
