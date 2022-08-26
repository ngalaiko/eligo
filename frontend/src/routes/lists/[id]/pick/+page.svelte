<script lang="ts">
	import { Button, Current } from '$lib/picks';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex flex-col m-auto items-center gap-2">
	<Current listId={data.listId} />
	<Button listId={data.listId} />
</div>
