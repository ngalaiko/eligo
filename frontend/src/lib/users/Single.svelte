<script lang="ts">
	import { useAuth } from '$lib/logux';

	import { useUser } from '$lib/users';

	export let userId: string;
	export let replaceSelf = true;

	const user = useUser(userId);
	const auth = useAuth();
</script>

{#if replaceSelf && userId === $auth.userId}
	<b id={$user.id}> you </b>
{:else if $user.isLoading === false}
	<b class="whitespace-nowrap" id={$user.id}>{$user.name}</b>
{/if}
