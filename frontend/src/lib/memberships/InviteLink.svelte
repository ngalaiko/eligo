<script lang="ts">
	import type { List } from '@eligo/protocol';
	import { nanoid } from 'nanoid';
	import IconX from '$lib/assets/IconX.svelte';
	import { ws } from '$lib/api';

	export let list: List;

	$: inviteLink = `${window.location.origin}/join/${list.invitatationId}/`;

	const createInviteLink = () =>
		ws.lists.update({
			id: list.id,
			updateTime: new Date().getTime(),
			invitatationId: nanoid()
		});

	const deleteInviteLink = () =>
		ws.lists.update({
			id: list.id,
			updateTime: new Date().getTime(),
			invitatationId: null
		});

	const copyInviteLink = () => navigator.clipboard.writeText(inviteLink);
</script>

<div class="text-sm opacity-50 flex gap-1 whitespace-nowrap overflow-ellipsis">
	{#if list.invitatationId}
		<button on:click={copyInviteLink} class="active:opacity-70 text-ellipsis overflow-hidden">
			{inviteLink}
		</button>
		<button on:click={deleteInviteLink}><IconX class="w-4 h-4 hover:text-red-900" /> </button>
	{:else}
		<button on:click={createInviteLink}>create invite link</button>
	{/if}
</div>
