<script lang="ts">
	import { createSubscription, removeSubscription } from '$lib/api';
	import { onMount } from 'svelte';

	let setSubscription: (subscription: PushSubscription | null) => void;
	let subscription = new Promise<PushSubscription | null>((resolve) => (setSubscription = resolve));

	const subscribe = () =>
		navigator.serviceWorker
			.getRegistration()
			.then((registration) => {
				subscription = registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey:
						'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
				});
				return subscription;
			})
			.then(createSubscription)
			.catch(console.error);

	const unsubscribe = (s: PushSubscription) =>
		Promise.all([
			removeSubscription(s),
			s.unsubscribe().then(() => (subscription = Promise.resolve(null)))
		]).catch(console.error);

	onMount(() =>
		navigator.serviceWorker
			.getRegistration()
			.then((registration) => registration.pushManager.getSubscription())
			.then(setSubscription)
	);
</script>

{#await subscription}
	loading...
{:then subscription}
	{#if subscription}
		<button class="underline" on:click={() => unsubscribe(subscription)}>unsubscribe</button>
	{:else}
		<button class="underline" on:click={() => subscribe()}>subscribe</button>
	{/if}
{/await}
