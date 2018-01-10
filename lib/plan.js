import {tap} from 'zora-reporter';
import {test, skip} from './test';

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
	},
	async run(sink = tap()) {
		const sinkIterator = sink();
		sinkIterator.next();
		try {
			const hasOnly = this.items.some(t => t.only);
			const tests = hasOnly ? this.items.map(t => t.only ? t : t.skip()) : this.items;
			const runningTests = tests.map(t => t.run());
			/* eslint-disable no-await-in-loop */
			for (const r of runningTests) {
				const executedTest = await r;
				sinkIterator.next(executedTest);
			}
			/* eslint-enable no-await-in-loop */
		} catch (err) {
			sinkIterator.throw(err);
		} finally {
			sinkIterator.return();
		}
	}
};

function factory() {
	return Object.create(PlanProto, {
		items: {value: []}, length: {
			get() {
				return this.items.length;
			}
		}
	});
}

export default factory;
