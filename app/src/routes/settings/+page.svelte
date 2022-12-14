<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button as NotificationsButton } from '$lib/webPushSubscriptions';
	import { IconChevronLeft } from '$lib/assets';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>settings</title>
</svelte:head>

<figure class="flex flex-col min-h-0 flex-1 gap-2">
	<figcaption>
		<a href="/lists/" class="hover:opacity-70 flex items-center">
			<IconChevronLeft class="w-4 h-4 -ml-2" />
			<span>lists</span>
		</a>
		<h2 class="whitespace-nowrap text-2xl font-semibold">settings</h2>
	</figcaption>

	<div class="flex flex-col gap-3">
		<span>update your profile:</span>

		<form
			method="POST"
			class="flex flex-col gap-2 items-end"
			use:enhance={() =>
				({ update }) =>
					update({ reset: false })}
		>
			<fieldset class="grid grid-cols-2 gap-1">
				<label for="username">username</label>
				<input
					id="username"
					name="username"
					type="text"
					disabled
					class="border-2"
					value={data.user.name}
				/>

				<label for="display-name">display name</label>
				<input
					id="display-name"
					name="display-name"
					type="text"
					value={data.user.displayName ?? data.user.name}
					class="border-2"
				/>

				<label for="password">password</label>
				<input
					id="password"
					name="password"
					type="password"
					placeholder="new password"
					class="border-2"
				/>
			</fieldset>

			<input value="update" type="submit" class="underline" />
		</form>
	</div>

	<div class="flex justify-between">
		<span>push notifications:</span>
		<NotificationsButton userId={data.user.id} />
	</div>
</figure>
