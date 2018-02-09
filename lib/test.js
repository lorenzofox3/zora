import assert from './assertions';

const tester = (collect, {offset = 0} = {}) => (description, spec) => {
	const buffer = [{type: 'title', data: description, offset}];
	const result = {count: 0, pass: true, description, spec};
	let done = false;

	const createAssertion = item => {
		result.pass = result.pass && item.pass;
		return {type: 'assert', data: item, offset};
	};

	const collector = item => {
		result.count++;
		item.id = result.count;
		if (item[Symbol.asyncIterator] === undefined) {
			// Assertion
			buffer.push(createAssertion(item));
		} else {
			// Sub test
			buffer.push(item);
		}
	};

	const handleDelegate = async delegate => {
		const {value, done} = await delegate.next();

		// Delegate is exhausted: create a summary test point in the stream and throw the delegate
		if (done === true) {
			const {executionTime, pass, description} = value;
			const subTestAssertion = Object.assign(createAssertion({
				pass,
				description,
				id: delegate.id,
				executionTime
			}), {type: 'testAssert'});
			buffer.shift();
			buffer.unshift(subTestAssertion);
			return instance.next();
		}
		return {value, done};
	};

	const subTest = tester(collector, {offset: offset + 1});

	const start = Date.now();
	// Execute the test collecting assertions
	const assertFn = assert(collector, subTest);
	const task = new Promise(resolve => resolve(spec(assertFn)))
		.then(() => {
			// Always report a plan and summary: the calling test will know how to deal with it
			result.executionTime = Date.now() - start;
			buffer.push({type: 'plan', data: {start: 1, end: result.count}, offset});
			buffer.push({type: 'time', data: result.executionTime, offset});
			done = true;
			return result;
		})
		.catch(err => {
			// We report a failing test before bail out ... while unhandled promise rejection is still allowed by nodejs...
			buffer.push({type: 'assert', data: {pass: false, description}});
			buffer.push({type: 'comment', data: 'Unhandled exception'});
			buffer.push({type: 'bailout', data: err, offset});
			done = true;
		});

	const instance = {
		test: subTest,
		task,
		[Symbol.asyncIterator]() {
			return this;
		},
		async next() {
			if (buffer.length === 0) {
				if (done === true) {
					return {done: true, value: result};
				}
				// Flush
				await task;
				return this.next();
			}

			const next = buffer[0];

			// Delegate if sub test
			if (next[Symbol.asyncIterator] !== undefined) {
				return handleDelegate(next);
			}

			return {value: buffer.shift(), done: false};
		}
	};

	// Collection by the calling test
	collect(instance);

	return instance;
};

export default tester;
