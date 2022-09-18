export { default as Single } from './Single.svelte';

import { state } from '$lib/api';
import { derived } from 'svelte/store';

export const list = derived(state, (state) => Object.values(state.users));
