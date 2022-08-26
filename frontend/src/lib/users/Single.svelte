<script lang="ts">
	import { useUser } from '$lib/users';

	export let userId: string;

	const user = useUser(userId);
</script>

{#if $user.isLoading === false}
	<b id={$user.id}>
		{$user.name}
	</b>
{/if}
