import test from 'tape';
import {map, filter, combine, stream} from "../lib/combinators";

const wait = (time = 10) => new Promise(resolve => {
	setTimeout(() => {resolve()}, time);
});

const counter = (limit = 3) => {
	let iter = 0;
	return {
		[Symbol.asyncIterator]() {
			return this;
		},
		async next() {
			if (iter >= limit) {
				return {done: true};
			}
			await wait();
			iter++;
			return {done: false, value: iter};
		}
	}
};

test('map combinator', async t => {
	t.plan(4);
	let i = 1;
	const mapSquare = map(x => x * x);
	const iterator = mapSquare(counter());
	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');

	while (true) {
		const {done, value} = await iterator.next();
		if (done === true) {
			break;
		}
		t.equal(value, i * i, `square ${i} should equal ${i * i}`);
		i++;
	}

	t.end();
});

test('filter combinator', async t => {
	t.plan(3);
	let i = 1;
	const mapSquare = filter(x => x % 2 === 1);
	const iterator = mapSquare(counter());
	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');

	while (true) {
		const {done, value} = await iterator.next();
		if (done === true) {
			break;
		}
		t.ok(value % 2 === 1, `${value} is odd`);
		i++;
	}

	t.end();
});

test('combine iterables', async t => {
	t.plan(7);
	const iterator = combine(counter(), counter());

	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');

	let i = 0;

	while (true) {
		const {done, value} = await iterator.next();
		if (done === true) {
			break;
		}
		i++;
		const iteratorNumber = i / 3 <= 1 ? 1 : 2;
		const iterationNumber = i - (iteratorNumber - 1) * 3;
		t.equal(value, iterationNumber, `should see iteration number ${iterationNumber} of iterator ${iteratorNumber}`);
	}

	t.end();
});

test('stream definition', t => {
	const iterator = stream(counter());
	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');
	t.equal(typeof iterator.filter, 'function', 'should have a filter method');
	t.equal(typeof iterator.map, 'function', 'should have a map method');
	t.end()
});

test('stream: map method', async t => {
	t.plan(6);
	let i = 1;
	const iterator = stream(counter()).map(x => x * x);
	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');
	t.equal(typeof iterator.filter, 'function', 'should have a filter method');
	t.equal(typeof iterator.map, 'function', 'should have a map method');

	while (true) {
		const {done, value} = await iterator.next();
		if (done === true) {
			break;
		}
		t.equal(value, i * i, `square ${i} should equal ${i * i}`);
		i++;
	}

	t.end();
});

test('stream: filter method', async t => {
	t.plan(5);
	let i = 1;
	const iterator = stream(counter()).filter(x => x % 2 === 1);
	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');
	t.equal(typeof iterator.filter, 'function', 'should have a filter method');
	t.equal(typeof iterator.map, 'function', 'should have a map method');

	while (true) {
		const {done, value} = await iterator.next();
		if (done === true) {
			break;
		}
		t.ok(value % 2 === 1, `${value} is odd`);
		i++;
	}

	t.end();
});

test('stream: chainable', async t => {
	t.plan(5);
	let i = 1;
	const iterator = stream(counter())
		.map(x => x * x)
		.filter(x => x % 2 === 1);

	t.ok(iterator[Symbol.asyncIterator], 'should be iterable asynchronously');
	t.equal(typeof iterator.filter, 'function', 'should have a filter method');
	t.equal(typeof iterator.map, 'function', 'should have a map method');

	while (true) {
		const {done, value} = await iterator.next();
		if (done === true) {
			break;
		}

		t.equal(value, i === 1 ? 1 : 9, `square ${i} should equal ${i * i}`);
		i++;
	}

	t.end();
});
