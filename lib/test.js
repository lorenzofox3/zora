import assert from './assertions';

const noop = () => {};
const skip = description => test('SKIPPED - ' + description, noop);

const Test = {
	async run() {
		const assertions = [];
		const collectResult = assertion => assertions.push(assertion);
		const start = Date.now();
		await this.spec(assert(collectResult));
		const items = await Promise.all(assertions);
		const executionTime = Date.now() - start;
		return Object.assign(this, {
			executionTime,
			items
		});
	},
	skip() {
		return skip(this.description);
	}
};

export default function test(description, spec, {only = false} = {}) {
	return Object.create(Test, {
		only: {value: only},
		spec: {value: spec},
		description: {value: description}
	});
}
