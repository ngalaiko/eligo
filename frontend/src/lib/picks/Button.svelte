<script lang="ts">
	import { createPick } from '$lib/picks';
	import { useAuth, useClient } from '$lib/logux';

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

<button on:click|preventDefault={pick} class="items-center underline">next</button>
