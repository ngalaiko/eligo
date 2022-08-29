import { test } from 'uvu';

import { eachStoreCheck } from '@logux/core';
import { memoryStore } from './index.js';

eachStoreCheck((desc, creator) => {
	test(
		`${desc}`,
		creator(() => memoryStore())
	);
});

test.run();
