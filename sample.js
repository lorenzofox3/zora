const test = require('./dist');

const wait = async (fn, time = 0) => {
	return new Promise(resolve => {
		setTimeout(() => {resolve(fn())}, time)
	});
};

test('foo bar bim', async t => {
	t.ok(true, 'sure');
	await wait(() => {}, 400);
	t.ok(false, 'not sure');
});

test('that one too', async t => {
	await wait(() => {}, 700);

	t.test('some subTest', async t => {
		t.ok(true, 'inner');
		await wait(() => {}, 200);

		t.test('deeply inside', async t=>{
			t.ok(true,'dale');
		});

		t.ok(false, 'oh noooo');
	});

	t.test('another sub test', t => {
		t.ok(true, 'oh yeah!');
	});

	t.ok('that', 'bim');
});