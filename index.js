import tester from './lib/test';
import tap from './lib/tap';
import {combine, stream} from './lib/combinators';

let flatten = true;
const tests = [];
const test = tester(t => tests.push(t));

// Provide a root context for BSD style test suite
const subTest = (test('Root', () => {})).test;
test.test = (description, spec) => {
	flatten = false; // Turn reporter into BSD style
	return subTest(description, spec);
};

const start = async ({reporter = tap()} = {}) => {
	let count = 0;
	let failure = 0;
	reporter({type: 'version', data: 13});

	// Remove the irrelevant root title
	await tests[0].next();

	let outputStream = stream(combine(...tests));
	outputStream = flatten ? outputStream
		.filter(({type}) => type !== 'testAssert')
		.map(item => Object.assign(item, {offset: 0})) :
		outputStream;

	const filterOutAtRootLevel = ['plan', 'time'];
	outputStream = outputStream
		.filter(item => item.offset > 0 || !filterOutAtRootLevel.includes(item.type))
		.map(item => {
			if (item.offset > 0 || (item.type !== 'assert' && item.type !== 'testAssert')) {
				return item;
			}

			count++;
			item.data.id = count;
			failure += item.data.pass ? 0 : 1;
			return item;
		});

	// One day with for await loops ... :) !
	while (true) {
		const {done, value} = await outputStream.next();

		if (done === true) {
			break;
		}

		reporter(value);

		if (value.type === 'bailout') {
			throw value.data; // Rethrow but with Nodejs we keep getting the deprecation warning (unhandled promise) and the process exists with 0 exit code...
		}
	}

	reporter({type: 'plan', data: {start: 1, end: count}});
	reporter({type: 'comment', data: failure > 0 ? `failed ${failure} of ${count} tests` : 'ok'});
};

// Auto bootstrap following async env vs sync env (browser vs node)
if (typeof window === 'undefined') {
	setTimeout(start, 0);
} else {
	window.addEventListener('load', start);
}

export default test;
