<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { ConnectedIndicator } from '$lib/components';
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

<div
	id="root"
	class="bg-background-soft text-foreground-2"
	class:is-light={data.theme === 'light'}
	class:is-dark={data.theme === 'dark'}
>
	<main class="flex flex-col max-w-lg h-screen p-4 mx-auto">
		<header class="flex justify-between pb-3 w-full">
			{#if data.user}
				<div class="flex gap-1 w-full items-center justify-start">
					<ConnectedIndicator />
					<span>{data.user.displayName ?? data.user.name}</span>
				</div>
				<div class="flex gap-6 w-full justify-end">
					<a class="underline" href="/settings/">settings</a>
					<form method="POST" action="/logout" use:enhance>
						<input class="underline cursor-pointer" value="logout" type="submit" />
					</form>
				</div>
			{/if}
		</header>

		<slot />
	</main>
</div>
