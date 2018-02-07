const test = require('./dist/');

const wait = async (time = 0) => {
	return new Promise(resolve => {
		setTimeout(() => {resolve()}, time)
	});
};

test('foo bar', async t => {
	let count = 1;

	t.ok(true, 'should be ok');

	await t.test('insider', async t => {
		await wait(1000);
		t.ok(count === 1, 'from inside');
		count++;
	});

	t.ok(count === 2, 'should be ok too');
});

test('another one bites the dust', async t => {
	let count = 1;

	await wait(300);
	t.ok(true, 'very true');

	t.test('insider too', async t => {
		await wait(500);
		t.ok(count === 1, 'from inside bis');
		count++;
	});

	t.ok(count === 1, 'And this one should not wait to execute !');
});

