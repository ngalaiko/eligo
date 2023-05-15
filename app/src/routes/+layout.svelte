<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { ReloadServiceWorker } from '$lib/components';
	import type { LayoutData } from './$types';
	import { enhance } from '$app/forms';
	import { connect } from '$lib/api';

	export let data: LayoutData;

	$: if (browser && data.user) connect(data.user);
</script>

{#if browser}
	<ReloadServiceWorker />
{/if}

<body
	id="root"
	class="bg-background-soft text-foreground-2"
	class:is-light={data.theme === 'light'}
	class:is-dark={data.theme === 'dark'}
>
	<main class="flex flex-col max-w-lg h-screen p-5 mx-auto">
		<header class="flex justify-between pb-3 w-full">
			{#if data.user}
				<h2>
					<a class="whitespace-nowrap flex gap-1" href="/">
						🎲<span class="text-lg font-semibold underline">eligo</span></a
					>
				</h2>

				<div class="flex gap-6 w-full justify-end">
					<a class="underline" href="/settings/" data-sveltekit-preload-data="hover">settings</a>
					<form method="POST" action="/logout/" use:enhance>
						<input class="underline cursor-pointer" value="logout" type="submit" />
					</form>
				</div>
			{/if}
		</header>

		<div class="flex-auto overflow-auto px-3 -mx-3">
			<slot />
		</div>
	</main>
</body>
