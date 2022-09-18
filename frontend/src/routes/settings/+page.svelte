<script lang="ts">
	import { Button as NotificationsButton } from '$lib/webPushSubscriptions';

	import { auth, updateUser } from '$lib/api';

	let form: HTMLFormElement;
	let passwordInput: HTMLInputElement;

	const update = async () => {
		const formData = new FormData(form);
		const password = formData.get('password') as string;
		if (password && password.length !== 0)
			await updateUser($auth.user.id, { password })
				.then(() => (passwordInput.value = ''))
				.catch(console.error);
	};
</script>

<svelte:head>
	<title>User</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-3">
		<span>update your profile:</span>
		<form class="flex flex-col gap-2 items-end" on:submit|preventDefault={update} bind:this={form}>
			<fieldset class="grid grid-cols-2 gap-1">
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
</div>
