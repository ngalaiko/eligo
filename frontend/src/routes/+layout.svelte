<script lang="ts">
	import '../app.postcss';
	import { Context } from '$lib/logux';
	import { webVitals } from '$lib/vitals';
	import { browser, dev } from '$app/env';
	import { page } from '$app/stores';

	const analyticsId = import.meta.env.VERCEL_ANALYTICS_ID;
	$: if (!dev && browser && analyticsId) {
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId
		});
	}
</script>

<Context>
	<main class="flex flex-col max-w-lg h-screen p-4 mx-auto">
		<slot />
	</main>
</Context>
