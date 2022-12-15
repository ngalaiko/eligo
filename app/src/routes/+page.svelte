<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	export let form: ActionData;

	$: redirect = browser ? $page.url.searchParams.get('redirect') ?? '/lists/' : '/lists/';
</script>

<svelte:head>
	<title>eligo</title>
</svelte:head>

<div class="flex flex-col items-center gap-4 h-1/2 text-xl">
	<form
		method="POST"
		action="?redirect={encodeURIComponent(redirect)}"
		class="grid gap-2 m-auto items-left"
		use:enhance
	>
		{#if form?.error}
			<p class="text-red-600">{form?.error}</p>
		{/if}

		<fieldset class="flex flex-col gap-1">
			<input
				id="username"
				name="username"
				type="text"
				placeholder="username"
				class="bg-inherit placeholder:text-foreground-4"
				required
			/>
			<input
				id="password"
				name="password"
				type="password"
				placeholder="password"
				class="bg-inherit placeholder:text-foreground-4"
				required
			/>
			<input type="submit" class="underline text-left" value="login" />
		</fieldset>

		<a class="opacity-50 text-sm text-left" href="/signup/?{$page.url.searchParams}">
			don't have an account?
		</a>
	</form>
</div>
