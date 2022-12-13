<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	export let form: ActionData;

	$: redirect = browser ? $page.url.searchParams.get('redirect') ?? '/lists/' : '/lists/';
</script>

<svelte:head>
	<title>signup</title>
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
			<input id="username" name="username" type="text" placeholder="username" required />
			<input id="password" name="password" type="password" placeholder="password" required />
			<input
				id="password-repeat"
				name="password-repeat"
				type="password-repeat"
				placeholder="repeat password"
				required
			/>
			<input type="submit" class="underline text-left" value="signup" />
		</fieldset>

		<a class="opacity-50 text-sm text-left" href="/?{$page.url.searchParams}">
			already have an account?
		</a>
	</form>
</div>
