<script lang="ts">
	import { Button, Current } from '$lib/picks';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div>
	<Current listId={data.listId} />
	<Button listId={data.listId} />
</div>
