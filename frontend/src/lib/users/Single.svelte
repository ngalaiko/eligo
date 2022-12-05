<script lang="ts">
	import { auth, ws } from '$lib/api';

	import { derived } from 'svelte/store';

	export let userId: string;
	export let replaceSelf = true;

	const user = derived(ws.users.list, (list) => list.find(({ id }) => id === userId));
</script>

{#if replaceSelf && userId === $auth.user?.id}
	<b id={$user.id}> you </b>
{:else}
	<b class="whitespace-nowrap" id={$user.id}>{$user.displayName ?? $user.name}</b>
{/if}
