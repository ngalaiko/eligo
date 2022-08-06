import { syncMapTemplate } from '@logux/client';
import type { ItemValue } from '@picker/protocol';

export const Item = syncMapTemplate<ItemValue>('items');
