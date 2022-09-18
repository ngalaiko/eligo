<script lang="ts">
	import '../app.postcss';
	import { webVitals } from '$lib/vitals';
	import { browser, dev } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth, logout } from '$lib/api';
	import { onMount } from 'svelte';

	const analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;
	$: if (!dev && browser && analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId
		});
	}

	const onLogoutClick = () =>
		logout()
			.then(() => ($auth.user = undefined))
			.then(() => goto('/'));

	onMount(() => {
		if (browser && !$auth.user && $page.url.pathname !== '/')
			goto('/?redirect=' + encodeURIComponent($page.url.pathname));
	});
</script>

<main class="flex flex-col max-w-lg h-screen p-4 mx-auto">
	<header class="flex gap-6 pb-3 w-full justify-end">
		{#if $auth.user}
			<a class="underline" href="/settings/">settings</a>
			<button on:click|preventDefault={onLogoutClick} class="underline">logout</button>
		{/if}
	</header>

	<slot />
</main>
