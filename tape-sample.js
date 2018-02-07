const test = require('tape');


const wait = async (fn, time = 0) => {
	return new Promise(resolve => {
		setTimeout(() => {resolve(fn())}, time)
	});
};

test('foo bar bim', t => {
	t.ok(true, 'sure');
	t.ok(false, 'not sure');
	t.end();
});

test('that one too', t => {

	t.test('some subTest', t => {
		t.ok(true, 'inner');
		t.test('deeply inside', t => {
			t.ok(true, 'dale');
			t.end();
		});
		t.ok(false, 'oh noooo');
		t.end();
	});

	t.test('another sub test', t => {
		t.ok(true, 'oh yeah!');
		t.end();
	});

	t.ok('that', 'bim');
	t.end();
});