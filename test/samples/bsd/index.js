const describe = require('../../../dist/index').test;

describe('tester 1', t => {

	t.ok(true, 'assert1');

	t.test('some nested tester', t => {
		t.ok(true, 'nested 1');
		t.ok(true, 'nested 2');
	});

	t.test('some nested tester bis', t => {
		t.ok(true, 'nested 1');

		t.test('deeply nested', t => {
			t.ok(true, 'deeply nested really');
			t.ok(true, 'deeply nested again');
		});

		t.ok(true, 'nested 2');
	});

	t.ok(true, 'assert2');
});

describe('tester 2', t => {
	t.ok(true, 'assert3');

	t.test('nested in two', t => {
		t.ok(true, 'still happy');
	});

	t.ok(true, 'assert4');
});
