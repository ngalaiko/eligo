<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const intervalMS = 60 * 1000;
	const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
		immediate: true,
		onRegistered: (swr) => {
			console.log(`SW registered: ${swr}`);

			swr &&
				setInterval(() => {
					swr.update();
				}, intervalMS);
		},
		onRegisterError: (error) => {
			console.log('SW registration error', error);
		}
	});

	let refreshing = false;

	$: if ($offlineReady || $needRefresh) {
		if (!refreshing) {
			updateServiceWorker(true);
			window.location.reload();
			refreshing = true;
		}
	}
</script>
