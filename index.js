import tester from './lib/test';
import tap from './lib/tap'

const tests = [];
const test = tester(t => tests.push(t));
setTimeout(async () => {
	tap({type:'version'});
	for (const t of tests) {
		while (true) {
			const {done, value} = await t.next();
			if (done === true) {
				break;
			}
			tap(value);
		}
	}
}, 0);

export default test;