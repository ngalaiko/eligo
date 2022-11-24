<script lang="ts">
	import '../app.postcss';
	import { webVitals } from '$lib/vitals';
	import { browser, dev } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { auth, logout } from '$lib/api';
	import { writable } from 'svelte/store';
	import { ConnectedIndicator } from '$lib';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';

	onMount(async () => {
		if (pwaInfo) {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegistered: () => console.log(`SW Registered`),
				onRegisterError: (error) => console.log('SW registration error', error)
			});
		}
	});

	$: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : '';

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

	const authLoaded = writable(false);
	auth.subscribe(({ user }) => {
		authLoaded.set(true);

		const isAuthenticated = user !== undefined;
		const redirectTo = $page.url.searchParams.get('redirect');
		const pathname = $page.url.pathname;
		const shouldRedirect = redirectTo !== null;

		if (!browser) return;
		else if (isAuthenticated && shouldRedirect) goto(redirectTo);
		else if (isAuthenticated && pathname === '/') goto('/lists/');
		else if (!isAuthenticated && pathname !== '/')
			goto('/?redirect=' + encodeURIComponent(pathname));
	});
</script>

<svelte:head>
	{@html webManifest}

	{#if !dev}
		<script
			async
			defer
			data-website-id="96bd2fa8-3fdd-4717-89fe-c6ce9e65a6a9"
			src="https://umami.eligo.rocks/umami.js"></script>
	{/if}
</svelte:head>

<main class="flex flex-col max-w-lg h-screen p-4 mx-auto">
	{#if $authLoaded}
		<header class="flex justify-between pb-3 w-full">
			{#if $auth.user}
				<div class="flex gap-1 w-full items-center justify-start">
					<ConnectedIndicator />
					<span>{$auth.user.name}</span>
				</div>
				<div class="flex gap-6 w-full justify-end">
					<a class="underline" href="/settings/">settings</a>
					<a class="underline" on:click={onLogoutClick} href="/">logout</a>
				</div>
			{/if}
		</header>

		<slot />
	{/if}
</main>
