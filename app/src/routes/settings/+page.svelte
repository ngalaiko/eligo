<script lang="ts">
	import { enhance } from '$app/forms';
	import { WebPushToggle } from '$lib/components';
	import { IconChevronLeft } from '$lib/assets';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>settings</title>
</svelte:head>

<figure class="flex flex-col min-h-0 flex-1 gap-6">
	<figcaption>
		<a href="/lists/" class="hover:opacity-70 flex items-center">
			<IconChevronLeft class="w-4 h-4 -ml-2" />
			<span>lists</span>
		</a>
		<h2 class="whitespace-nowrap text-2xl font-semibold">settings</h2>
	</figcaption>

	<div class="flex flex-col gap-1">
		<span>profile:</span>

		<form
			method="POST"
			action="?/update"
			class="flex flex-col items-end gap-2"
			use:enhance={() =>
				({ update }) =>
					update({ reset: false })}
		>
			<fieldset class="flex flex-col gap-2 w-full pl-20">
				<div class="flex justify-between items-center">
					<label for="username">username</label>
					<input
						id="username"
						name="username"
						type="text"
						disabled
						class="border-2 bg-inherit placeholder:text-foreground-4"
						value={data.user.name}
					/>
				</div>

				<div class="flex justify-between items-center">
					<label for="display-name">display name</label>
					<input
						id="display-name"
						name="display-name"
						type="text"
						value={data.user.displayName ?? data.user.name}
						class="border-2 bg-inherit placeholder:text-foreground-4"
					/>
				</div>

				<div class="flex justify-between items-center">
					<label for="password">password</label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="new password"
						class="border-2 bg-inherit placeholder:text-foreground-4"
					/>
				</div>
			</fieldset>

			<button type="submit" class="underline">update</button>
		</form>
	</div>

	<div class="flex flex-col gap-1">
		<span>this browser:</span>

		<form method="POST" action="?/theme" class="flex flex-col items-end gap-2">
			<fieldset class="flex flex-col gap-2 w-full pl-20">
				<div class="flex justify-between items-center">
					<span>push notifications:</span>
					<WebPushToggle userId={data.user.id} />
				</div>

				<div class="flex justify-between items-center">
					<label for="theme">colours:</label>
					<select name="theme" class="bg-inherit">
						<option value="auto" selected={data.theme === 'auto'}>auto</option>
						<option value="light" selected={data.theme === 'light'}>light</option>
						<option value="dark" selected={data.theme === 'dark'}>dark</option>
					</select>
				</div>
			</fieldset>

			<button type="submit" class="underline">update</button>
		</form>
	</div>
</figure>
