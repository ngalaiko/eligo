<script lang="ts">
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
					.then((registration) => {
						if (!registration) return;
						return registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey:
								'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
						});
					})
					.then((subscription) => {
						if (!subscription) return;
						fetch('/web-push', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(subscription.toJSON())
						});
					});
			})
			.then(() => (isEnabled = true))
			.finally(() => (isSubscribing = false))
			.catch(console.error);
	};

	const unsubscribe = async () => {
		isUnsubscribing = true;
		return navigator.serviceWorker
			.getRegistration()
			.then((registration) => {
				if (!registration) return;
				return registration.pushManager.getSubscription();
			})
			.then((subscription) => {
				if (!subscription) return;
				Promise.all([
					fetch('/web-push', {
						method: 'DELETE',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(subscription.toJSON())
					}),
					subscription.unsubscribe().then(() => (isEnabled = false))
				])
					.finally(() => (isUnsubscribing = false))
					.catch(console.error);
			});
	};

	onMount(() =>
		navigator.serviceWorker.getRegistration().then((registration) => {
			if (registration?.pushManager) {
				isSupported = true;
				registration.pushManager
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
		<span>subscribing...</span>
	{:else if isUnsubscribing}
		<span>unsubscribing...</span>
	{:else if isEnabled}
		<input checked type="checkbox" on:click={() => unsubscribe()} />
	{:else}
		<input type="checkbox" on:click={() => subscribe()} />
	{/if}
{:else}
	not supported
{/if}
