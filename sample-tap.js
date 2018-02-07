const tap = require('tap');

tap.test('foo bar bim', t => {
	t.ok(true, 'sure');
	t.ok(true, 'not sure');
	t.end();
});

tap.test('that one too', t => {
	t.test('some subTest', t => {
		t.ok(true, 'inner');
		t.test('deeply inside', t => {
			t.ok(true, 'dale');
			t.end();
		});
		t.ok(true, 'oh noooo');
		t.end();
	});

	t.test('another sub tap', t => {
		t.ok(true, 'oh yeah!');
		t.end();
	});

	t.ok('that', 'bim');
	t.end();
});