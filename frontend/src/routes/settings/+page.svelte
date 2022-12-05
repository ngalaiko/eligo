<script lang="ts">
	import { Button as NotificationsButton } from '$lib/webPushSubscriptions';
	import { auth, http, ws } from '$lib/api';
	import IconChevronLeft from '$lib/assets/IconChevronLeft.svelte';
	import { derived } from 'svelte/store';

	let form: HTMLFormElement;
	let passwordInput: HTMLInputElement;

	const onUpdateClicked = async () => {
		const formData = new FormData(form);
		const password = formData.get('password') as string;
		const displayName = formData.get('display-name') as string;
		if (displayName && displayName.length !== 0) ws.users.update({ displayName });
		if (password && password.length !== 0)
			await http({ fetch })
				.users.update($auth.user.id, { password })
				.then(() => (passwordInput.value = ''))
				.catch(console.error);
	};

	const user = derived(ws.users.list, (list) => list.find(({ id }) => id === $auth.user.id));
</script>

<svelte:head>
	<title>settings</title>
</svelte:head>

<figure class="flex flex-col min-h-0 flex-1 gap-2">
	<figcaption>
		<a
			href="/lists/"
			on:click|preventDefault={() => window.history.back()}
			class="hover:opacity-70 flex items-center"
		>
			<IconChevronLeft class="w-4 h-4 -ml-2" />
			<span>back</span>
		</a>
		<h2 class="whitespace-nowrap text-2xl font-semibold">settings</h2>
	</figcaption>

	<div class="flex flex-col gap-3">
		<span>update your profile:</span>
		<form
			class="flex flex-col gap-2 items-end"
			on:submit|preventDefault={onUpdateClicked}
			bind:this={form}
		>
			<fieldset class="grid grid-cols-2 gap-1">
				<label for="username">username</label>
				<input
					bind:this={passwordInput}
					id="username"
					name="username"
					type="text"
					disabled
					value={$user?.name}
					class="border-2"
				/>

				<label for="display-name">display name</label>
				<input
					bind:this={passwordInput}
					id="display-name"
					name="display-name"
					type="text"
					value={$user?.displayName ?? $user?.name}
					class="border-2"
				/>

				<label for="password">password</label>
				<input
					bind:this={passwordInput}
					id="password"
					name="password"
					type="password"
					placeholder="new password"
					class="border-2"
				/>
			</fieldset>
			<button type="submit" class="underline">update</button>
		</form>
	</div>
	<div class="flex justify-between">
		<span>push notifications:</span>
		<NotificationsButton />
	</div>
</figure>
