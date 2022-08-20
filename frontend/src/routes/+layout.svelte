<script lang="ts">
	import '../app.postcss';
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
	<header class="inline-flex gap-6 px-4 pt-2 w-full justify-between">
		{#if $session.user}
			<span class="inline-flex gap-1">
				you are logged in as
				<b>
					<UserCard user={$session.user} replaceSelf={false} />
				</b>
			</span>
			<button on:click|preventDefault={logout} class="underline">logout</button>
		{/if}
	</header>

	<main class="p-4">
		<slot />
	</main>
</Context>
