<script lang="ts">
	import { List, Form } from '$lib/items';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Form listId={data.listId} />
<List listId={data.listId} />
