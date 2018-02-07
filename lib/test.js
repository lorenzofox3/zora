import assert from './assertions';


const Test = {
	[Symbol.asyncIterator]() {
		return this;
	},
	async next() {
		if (this.buffer.length === 0) {
			if (this.result !== null) {
				return {done: true, value: this.result};
			}
			// Flush
			await this.coRoutine;
			return this.next();
		}

		const next = this.buffer[0];

		// Delegate with sub tests
		if (next[Symbol.asyncIterator] !== void 0) {
			const delegated = await next.next();

			// Delegate is exhausted
			if (delegated.done === true) {
				const {executionTime, count, offset} = delegated.value;
				this.buffer.shift();
				this.buffer.unshift({type: 'time', data: executionTime, offset});
				this.buffer.unshift({type: 'plan', data: {start: 1, end: count}, offset});
				return this.next();
			}

			return delegated;
		}

		return {value: this.buffer.shift(), done: false};
	}
};

export default (collect, offset = 0) => (description, spec) => {
	const buffer = [{type: 'title', data: description, offset}];
	let result = null;
	let count = 0;

	// Start assertion collection
	const assertFn = assert(i => {
		count++;
		if (i.data) {
			i.data.id = count;
		} else {
			i.id = count;
		}
		buffer.push(i);
	}, offset);
	const start = Date.now();
	const coRoutine = Promise.resolve(spec(assertFn))
		.then(() => {
			return {
				offset,
				spec,
				description,
				count,
				executionTime: Date.now() - start
			};
		})
		.then(r => result = r);

	const test = Object.create(Test, {
		buffer: {value: buffer},
		coRoutine: {value: coRoutine},
		result: {get() {return result;}},
		count: {get() {return count;}}
	});

	// Collection by the calling test
	collect(test);

	return test;
};
