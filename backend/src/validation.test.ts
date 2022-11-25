import { test } from 'uvu';
import { equal } from 'uvu/assert';
import { codeInvalid, codeRequired, validate } from './validation.js';

const tests = [
	{
		name: 'required but missing',
		value: { id: undefined },
		rules: { id: 'required' },
		expected: {
			code: codeRequired,
			message: 'id is required'
		}
	},
	{
		name: 'required provided',
		value: { id: 1 },
		rules: { id: 'required' },
		expected: undefined
	},

	{
		name: 'empty but provided',
		value: { id: 1 },
		rules: { id: 'empty' },
		expected: {
			code: codeInvalid,
			message: 'id must be empty'
		}
	},
	{
		name: 'empty not provided',
		value: { id: undefined },
		rules: { id: 'empty' },
		expected: undefined
	},

	{
		name: 'strict but different',
		value: { id: 1 },
		rules: { id: 2 },
		expected: {
			code: codeInvalid,
			message: 'invalid id'
		}
	},
	{
		name: 'strict and same',
		value: { id: 1 },
		rules: { id: 1 },
		expected: undefined
	},

	{
		name: 'multiple failures, first returned',
		value: { id: undefined, value: 2, key: 4 },
		rules: { id: 'required', value: 3, key: 'required' },
		expected: { code: codeRequired, message: 'id is required' }
	}
];

tests.forEach(({ name, value, rules, expected }) =>
	test(name, () => equal(validate(value, rules), expected))
);

test.run();
