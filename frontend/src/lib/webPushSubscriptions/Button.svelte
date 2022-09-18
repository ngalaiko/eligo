<script lang="ts">
	import { create, delete as remove } from '$lib/webPushSubscriptions';
	import { onMount } from 'svelte';

	let isSupported = false;
	let isEnabled = false;
	let isSubscribing = false;
	let isUnsubscribing = false;

	const subscribe = async () => {
		isSubscribing = true;
		return Notification.requestPermission()
			.then(async (result) => {
				if (result !== 'granted') return;
				return navigator.serviceWorker
					.getRegistration()
					.then((registration) =>
						registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey:
								'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
						})
					)
					.then((s) => {
						const sj = s.toJSON();
						create({
							endpoint: sj.endpoint,
							expirationTime: sj.expirationTime,
							keys: {
								auth: sj.keys.auth,
								p256dh: sj.keys.p256dh
							}
						});
					});
			})
			.finally(() => ((isEnabled = true), (isSubscribing = false)))
			.catch(console.error);
	};

	const unsubscribe = async () => {
		isUnsubscribing = true;
		return navigator.serviceWorker
			.getRegistration()
			.then((registration) => registration.pushManager.getSubscription())
			.then((subscription) =>
				Promise.all([
					remove({ id: subscription.endpoint }),
					subscription.unsubscribe().then(() => (isEnabled = false))
				])
					.finally(() => (isUnsubscribing = false))
					.catch(console.error)
			);
	};

	onMount(() =>
		navigator.serviceWorker.getRegistration().then(async (registration) => {
			if (registration.pushManager) {
				isSupported = true;
				return registration.pushManager
					.getSubscription()
					.then((subscription) => (isEnabled = !!subscription));
			} else {
				isSupported = false;
			}
		})
	);
</script>

{#if isSupported}
	{#if isSubscribing}
		<span>enabling...</span>
	{:else if isUnsubscribing}
		<span>disabling...</span>
	{:else if isEnabled}
		<button class="underline" on:click={() => unsubscribe()}>disable</button>
	{:else}
		<button class="underline" on:click={() => subscribe()}>enable</button>
	{/if}
{:else}
	not supported
{/if}
