import tap from 'zora-tap-reporter';
import {test, skip} from './test';

// Force to resolve on next tick so consumer can do something with previous iteration result
const onNextTick = val => new Promise(resolve => setTimeout(() => resolve(val), 0));

const PlanProto = {
	[Symbol.iterator]() {
		return this.items[Symbol.iterator]();
	},
	test(description, spec, opts) {
		if (!spec && description.test) {
			// If it is a plan
			this.items.push(...description);
		} else {
			this.items.push(test(description, spec, opts));
		}
		return this;
	},
	only(description, spec) {
		return this.test(description, spec, {only: true});
	},
	skip(description, spec) {
		if (!spec && description.test) {
			// If it is a plan we skip the whole plan
			for (const t of description) {
				this.items.push(t.skip());
			}
		} else {
			this.items.push(skip(description));
		}
		return this;
	}
};

const runnify = fn => async function (sink = tap()) {
	const sinkIterator = typeof sink[Symbol.iterator] === 'function' ?
		sink[Symbol.iterator]() :
		sink(); // Backward compatibility
	sinkIterator.next();
	try {
		const hasOnly = this.items.some(t => t.only);
		const tests = hasOnly ? this.items.map(t => t.only ? t : t.skip()) : this.items;
		await fn(tests, sinkIterator);
	} catch (err) {
		sinkIterator.throw(err);
	} finally {
		sinkIterator.return();
	}
};

export default function factory({sequence = false} = {sequence: false}) {
	/* eslint-disable no-await-in-loop */
	const exec = sequence === true ? async (tests, sinkIterator) => {
		for (const t of tests) {
			const result = await onNextTick(t.run());
			sinkIterator.next(result);
		}
	} : async (tests, sinkIterator) => {
		const runningTests = tests.map(t => t.run());
		for (const r of runningTests) {
			const executedTest = await onNextTick(r);
			sinkIterator.next(executedTest);
		}
	};
	/* eslint-enable no-await-in-loop */

	return Object.assign(Object.create(PlanProto, {
		items: {value: []}, length: {
			get() {
				return this.items.length;
			}
		}
	}), {
		run: runnify(exec)
	});
}
