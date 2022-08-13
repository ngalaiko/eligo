<script lang="ts">
	import { Context } from '$lib/logux';
	import { session } from '$app/stores';

	const logout = async () => {
		await fetch('/api/auth', {
			method: 'DELETE',
			credentials: 'include'
		})
			.then(() => {
				$session = {};
			})
			.catch(console.error);
	};
</script>

<Context>
	<header>
		{#if $session.user}
			{$session.user.name}
			<button on:click|preventDefault={logout}>logout</button>
		{/if}
	</header>
	<main>
		<slot />
	</main>
</Context>
