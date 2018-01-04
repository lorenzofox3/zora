import assert from './assertions';

const noop = () => {};

export const skip = description => test('SKIPPED - ' + description, noop);

const Test = {
	async run() {
		const collect = assertion => this.items.push(assertion);
		const start = Date.now();
		await Promise.resolve(this.spec(assert(collect)));
		const executionTime = Date.now() - start;
		return {
			items: this.items,
			description: this.description,
			executionTime
		};
	},
	skip() {
		return skip(this.description);
	}
};

export function test(description, spec, {only = false} = {}) {
	return Object.create(Test, {
		items: {value: []},
		only: {value: only},
		spec: {value: spec},
		description: {value: description}
	});
}
