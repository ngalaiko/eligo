<script lang="ts">
	import { Context } from '$lib/logux';
	import { session, page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import { Card as UserCard } from '$lib/users';

	const logout = async () => {
		await fetch('/api/auth', {
			method: 'DELETE',
			credentials: 'include'
		})
			.then(() => {
				$session = {};
				goto('/');
			})
			.catch(console.error);
	};

	session.subscribe((session) => {
		if (browser && !session.user && $page.url.pathname !== '/')
			goto('/?redirect=' + encodeURIComponent($page.url.href));
	});
</script>

<Context>
	<header>
		{#if $session.user}
			<div>
				<div>you are logged in as <UserCard user={$session.user} /></div>
				<button on:click|preventDefault={logout}>logout</button>
			</div>
		{/if}
	</header>
	<main>
		<slot />
	</main>
</Context>
