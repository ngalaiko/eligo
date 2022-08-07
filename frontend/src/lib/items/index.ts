import { useFilter } from '$lib/logux';
import { syncMapTemplate } from '@logux/client';
import type { Client } from '@logux/client';
import type { Item } from '@picker/protocol';

export const store = syncMapTemplate<Item>('items');

export const useItems = (client: Client) => useFilter(client, store);
