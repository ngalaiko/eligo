<script lang="ts">
	import { useLists } from '$lib/lists';
	import { createMembership, useMemberships } from '$lib/memberships';
	import type { PageData } from './$types';
	import { useAuth, useClient } from '$lib/logux';
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';

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
		}).then(() => goto(`/lists/${listId}/`));
	};

	const computed = derived([lists, memberships], ([lists, memberships]) => {
		if (lists.isLoading !== false) return { isLoading: true };
		if (lists.list.length === 0) return { isLoading: false, invalidLink: true };
		if (memberships.isLoading !== false) return { isLoading: true };
		const existingMembership = memberships.list.find(
			(membership) => membership.listId === lists.list[0].id
		);
		return {
			isLoading: false,
			list: lists.list[0],
			isMember: !!existingMembership || lists.list[0].userId === $auth.userId
		};
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
