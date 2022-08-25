<script lang="ts">
	import type { List } from '@eligo/protocol';
	import { updateList } from '$lib/lists';
	import { nanoid } from 'nanoid';
	import { useClient } from '$lib/logux';
	import IconX from '$lib/assets/IconX.svelte';
	import IconCopy from '$lib/assets/IconCopy.svelte';

	export let list: List & { id: string };

	const client = useClient();

	$: inviteLink = `${window.location.origin}/join/${list.invitatationId}/`;

	const createInviteLink = () =>
		updateList(client, list.id, {
			invitatationId: nanoid()
		});

	const deleteInviteLink = () =>
		updateList(client, list.id, {
			invitatationId: null
		});

	const copyInviteLink = () => {
		navigator.clipboard.writeText(inviteLink);
	};
</script>

<div class="text-sm opacity-50 flex gap-1">
	{#if list.invitatationId}
		<button on:click={copyInviteLink} class="active:opacity-70 text-ellipsis overflow-hidden">
			{inviteLink}
		</button>
		<button on:click={deleteInviteLink}><IconX class="w-4 h-4 hover:text-red-900" /> </button>
	{:else}
		<button on:click={createInviteLink}>create invite link</button>
	{/if}
</div>
