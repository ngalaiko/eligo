<script lang="ts">
	import { useLists } from '$lib/lists';
	import { createMembership, useMemberships } from '$lib/memberships';
	import type { PageData } from './$types';
	import { useAuth, useClient } from '$lib/logux';
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/stores';

	export let data: PageData;

	const client = useClient();
	const auth = useAuth();
	const lists = useLists({ invitatationId: data.invitationId });
	const memberships = useMemberships({ userId: $auth.userId });

	const join = (listId: string) => {
		createMembership(client, {
			userId: $auth.userId,
			listId: listId,
			createTime: new Date().getTime()
		}).then(() => goto(`/lists/${listId}/items/`));
	};

	const computed = derived([lists, memberships], ([lists, memberships]) => {
		if (lists.length === 0) return { isLoading: false, invalidLink: true };
		const existingMembership = memberships.find((membership) => membership.listId === lists[0].id);
		return {
			isLoading: false,
			list: lists[0],
			isMember: !!existingMembership || lists[0].userId === $auth.userId
		};
	});

	onMount(async () => {
		await client.node.waitFor('disconnected');
		if (browser && !$auth.isAuthenticated && $page.url.pathname !== '/')
			goto('/?redirect=' + encodeURIComponent($page.url.pathname));
	});
</script>

{#if $computed.isLoading}
	loading...
{:else if $computed.isLoading === false}
	{#if $computed.invalidLink}
		Invalid link
	{:else if $computed.isMember}
		You are already a member of <a class="underline" href="/lists/{$computed.list.id}/"
			>{$computed.list.title}</a
		>
	{:else}
		<button class="underline" on:click={() => join($computed.list.id)}
			>Join {$computed.list.title}</button
		>
	{/if}
{/if}
