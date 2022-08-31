import { useItems } from '$lib/items';
import { useMemberships } from '$lib/memberships';
import { usePicks } from '$lib/picks';
import type { Item, Membership, Pick } from '@eligo/protocol';
import { compareDesc } from 'date-fns';
import { derived } from 'svelte/store';

type Entry = {
	userId: string;
	time: number;
};

export type ItemCreated = Entry & {
	type: 'items/created';
	itemId: string;
};

const itemToEntry = (item: Item & { id: string }): ItemCreated => ({
	type: 'items/created',
	userId: item.userId,
	time: item.createTime,
	itemId: item.id
});

export type MembershipCreated = Entry & {
	type: 'memberships/created';
};

const membershipToEntry = (membership: Membership): MembershipCreated => ({
	type: 'memberships/created',
	userId: membership.userId,
	time: membership.createTime
});

export type PickCreated = Entry & {
	type: 'picks/created';
	itemId: string;
};

const pickToEntry = (pick: Pick): PickCreated => ({
	type: 'picks/created',
	userId: pick.userId,
	time: pick.createTime,
	itemId: pick.itemId
});

export const useHistory = ({ listId }: { listId: string }) =>
	derived(
		[useItems({ listId }), useMemberships({ listId }), usePicks({ listId })],
		([items, memberships, picks]) =>
			[
				...items.list.filter(({ isLoading }) => !isLoading).map(itemToEntry),
				...memberships.list.filter(({ isLoading }) => !isLoading).map(membershipToEntry),
				...picks.list
					.filter(({ isLoading }) => !isLoading)
					.filter((p) => !!p.itemId)
					.map(pickToEntry)
			].sort((a, b) => compareDesc(a.time, b.time))
	);
