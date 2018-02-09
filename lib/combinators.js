// Some combinators for asynchronous iterators: this will be way more easier when
// Async generator are widely supported

const asyncIterator = behavior => Object.assign({
	[Symbol.asyncIterator]() {
		return this;
	}
}, behavior);

export const filter = predicate => iterator => asyncIterator({
	async next() {
		const {done, value} = await iterator.next();

		if (done === true) {
			return {done};
		}

		if (!predicate(value)) {
			return this.next();
		}

		return {done, value};
	}
});

export const map = mapFn => iterator => asyncIterator({
	[Symbol.asyncIterator]() {
		return this;
	},
	async next() {
		const {done, value} = await iterator.next();
		if (done === true) {
			return {done};
		}
		return {done, value: mapFn(value)};
	}
});

export const stream = asyncIterator => Object.assign(asyncIterator, {
	map(fn) {
		return stream(map(fn)(asyncIterator));
	},
	filter(fn) {
		return stream(filter(fn)(asyncIterator));
	}
});

export const combine = (...iterators) => {
	const [...pending] = iterators;
	let current = pending.shift();

	return asyncIterator({
		async next() {
			if (current === undefined) {
				return {done: true};
			}

			const {done, value} = await current.next();

			if (done === true) {
				current = pending.shift();
				return this.next();
			}

			return {done, value};
		}
	});
};
