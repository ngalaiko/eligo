<script lang="ts">
	import { createPick } from '$lib/picks';
	import { useAuth, useClient } from '$lib/logux';
	import IconDice from '$lib/assets/IconDice.svelte';

	const client = useClient();
	const auth = useAuth();

	export let listId: string;

	const pick = async () => {
		await createPick(client, {
			listId,
			userId: $auth.userId,
			createTime: new Date().getTime()
		});
	};
</script>

<button
	on:click|preventDefault={pick}
	class="flex gap-2 border-2 px-2 py-1 rounded-2xl w-full items-center"
>
	<IconDice class="opacity-50" />
</button>
