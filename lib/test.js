import assert from './assertions';

const noop = () => {};
const skip = description => test('SKIPPED - ' + description, noop);

const Test = {
	async run() {
		const tests = [];
		const collectResult = tp => tests.push(tp);
		const start = Date.now();
		await this.spec(assert(collectResult)); // Collection
		const testPoints = await Promise.all(tests); // Execution (some collection functions are async such sub test)
		const executionTime = Date.now() - start;
		return Object.assign(this, {
			executionTime,
			testPoints
		});
	},
	skip() {
		return skip(this.description);
	}
};

export default (description, spec, {only = false} = {}) => Object.create(Test, {
	only: {value: only},
	spec: {value: spec},
	description: {value: description}
});
