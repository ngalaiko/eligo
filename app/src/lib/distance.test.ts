import { addDays } from 'date-fns';
import { test } from 'uvu';
import { equal } from 'uvu/assert';
import { format } from './distance';

const now = new Date(1671199529501); // Friday 16 Dec 2022

[
	{ from: now, result: 'less than a minute ago' },
	{ from: addDays(now, -1), result: 'yesterday' },
	{ from: addDays(now, -2), result: 'Wednesday' },
	{ from: addDays(now, -3), result: 'Tuesday' },
	{ from: addDays(now, -4), result: 'Monday' },
	{ from: addDays(now, -5), result: 'last Sunday' },
	{ from: addDays(now, -6), result: 'last Saturday' },
	{ from: addDays(now, -7), result: 'last Friday' },
	{ from: addDays(now, -8), result: 'last Thursday' },
	{ from: addDays(now, -9), result: 'last Wednesday' },
	{ from: addDays(now, -10), result: 'last Tuesday' },
	{ from: addDays(now, -11), result: 'last Monday' },
	{ from: addDays(now, -12), result: '12 days ago' },
	{ from: addDays(now, -13), result: '13 days ago' },
	{ from: addDays(now, -14), result: '14 days ago' },
	{ from: addDays(now, -15), result: '15 days ago' }
].forEach(({ from, result }) => test(result, () => equal(format(from, now), result)));

test.run();
