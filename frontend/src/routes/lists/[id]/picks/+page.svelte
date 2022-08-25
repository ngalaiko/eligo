<script lang="ts">
	import { List } from '$lib/picks';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<List listId={data.listId} />
