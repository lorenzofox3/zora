import tester from './lib/test';
import tap from './lib/tap';

const onNextTick = v => new Promise(resolve => {
	setTimeout(() => {
		resolve(v);
	}, 0);
});


const factory = (reporter = tap) => {
	const tests = [];
	let pass = 0;
	let fail = 0;

	setTimeout(async () => {
		for (const t of tests) {
			const r = await onNextTick(t); // On next tick to give some time to the reporter if it needs (like browser reporter)
			if (r.pass) {
				pass++;
			} else {
				fail++;
			}
			reporter(r);
		}
		//todo print summary!
	}, 0);

	//todo add a only/skip on the factory
	const test = (description, spec) => {
		const t = tester(description, spec);
		tests.push(t.run());
	};

	return test;
};

export default factory()