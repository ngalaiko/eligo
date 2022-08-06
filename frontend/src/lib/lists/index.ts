import { useFilter } from '$lib/logux';
import { syncMapTemplate } from '@logux/client';
import type { Client } from '@logux/client';
import type { ListValue } from '@picker/protocol';

export const List = syncMapTemplate<ListValue>('lists');

export const useLists = (client: Client) => useFilter(client, List);
