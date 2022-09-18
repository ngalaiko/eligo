import { state } from '$lib/api';
import { derived } from 'svelte/store';

export { default as InviteLink } from './InviteLink.svelte';

export const list = derived(state, (state) => Object.values(state.memberships));
