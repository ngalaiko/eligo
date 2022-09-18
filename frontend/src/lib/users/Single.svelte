<script lang="ts">
	import { auth } from '$lib/api';

	import { list } from '$lib/users';
	import { derived } from 'svelte/store';

	export let userId: string;
	export let replaceSelf = true;

	const user = derived(list, (list) => list.find(({ id }) => id === userId));
</script>

{#if replaceSelf && userId === $auth.user?.id}
	<b id={$user.id}> you </b>
{:else}
	<b class="whitespace-nowrap" id={$user.id}>{$user.name}</b>
{/if}
