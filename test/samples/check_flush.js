const test = require('../../dist/index');

const wait = time => new Promise(resolve => {
	setTimeout(() => resolve(), time);
});

test('tester flush', async t => {
	await wait(1000);
	t.ok(true, 'assert1');
});
