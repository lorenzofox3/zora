import test from 'tape';
import assertions from '../lib/assertions';

test('ok operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.ok('true');
	t.equal(operator, 'ok', 'should have the operator ok');
	t.equal(description, 'should be truthy', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('ok operator: change description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass, expected, actual} = a.ok(0, 'not default!');
	t.equal(operator, 'ok', 'should have the operator ok');
	t.equal(description, 'not default!', 'should not have the default description');
	t.equal(pass, false, 'should not have passed');
	t.equal(expected, true);
	t.equal(actual, 0, 'should have provided the acual value');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('deepEqual operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.deepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}});
	t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
	t.equal(description, 'should be equivalent', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('deepEqual operator: change description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass, expected, actual} = a.deepEqual({foo: 'bar'}, {blah: 'bar'}, 'woot woot');
	t.equal(operator, 'deepEqual', 'should have the operator deepEqual');
	t.equal(description, 'woot woot', 'should not have the default description');
	t.equal(pass, false, 'should not have passed');
	t.deepEqual(actual, {foo: 'bar'});
	t.deepEqual(expected, {blah: 'bar'});
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('equal operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.equal('foo', 'foo');
	t.equal(operator, 'equal', 'should have the operator equal');
	t.equal(description, 'should be equal', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('equal operator: change default description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.equal({foo: 'foo'}, {foo: 'foo'}, 'woot ip');
	t.equal(operator, 'equal', 'should have the operator equal');
	t.equal(description, 'woot ip', 'should have the custom description');
	t.equal(pass, false, 'should not have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('notOk operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.notOk(false);
	t.equal(operator, 'notOk', 'should have the operator notOk');
	t.equal(description, 'should not be truthy', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('notOk operator: change description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass, expected, actual} = a.notOk(1, 'not default!');
	t.equal(operator, 'notOk', 'should have the operator notOk');
	t.equal(description, 'not default!', 'should not have the default description');
	t.equal(pass, false, 'should not have passed');
	t.equal(expected, false);
	t.equal(actual, 1, 'should have provided the acual value');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('notDeepEqual operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.notDeepEqual({foo: {bar: 'blah'}}, {foo: {bar: 'bar'}});
	t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
	t.equal(description, 'should not be equivalent', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('notDeepEqual operator: change description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass, expected, actual} = a.notDeepEqual({foo: {bar: 'bar'}}, {foo: {bar: 'bar'}}, 'woot woot');
	t.equal(operator, 'notDeepEqual', 'should have the operator notDeepEqual');
	t.equal(description, 'woot woot', 'should not have the default description');
	t.equal(pass, false, 'should not have passed');
	t.deepEqual(actual, {foo: {bar: 'bar'}});
	t.deepEqual(expected, {foo: {bar: 'bar'}});
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('notEqual operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.notEqual({foo: 'bar'}, {foo: 'bar'});
	t.equal(operator, 'notEqual', 'should have the operator notEqual');
	t.equal(description, 'should not be equal', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('notEqual operator: change default description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.notEqual('foo', 'foo', 'blah');
	t.equal(operator, 'notEqual', 'should have the operator notEqual');
	t.equal(description, 'blah', 'should have the default description');
	t.equal(pass, false, 'should not have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('fail', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.fail();
	t.equal(operator, 'fail', 'should have the operator fail');
	t.equal(description, 'fail called', 'should have the default description');
	t.equal(pass, false, 'should not have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('fail: change default description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.fail('should not get here');
	t.equal(operator, 'fail', 'should have the operator fail');
	t.equal(description, 'should not get here', 'should have the default description');
	t.equal(pass, false, 'should not have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.throws(() => {
		throw new Error();
	});
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'should throw', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator: change default description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.throws(() => {
		throw new Error();
	}, 'unexepected lack of error');
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'unexepected lack of error', 'should have the custom description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator: failure', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.throws(() => {
	});
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'should throw', 'should have the default description');
	t.equal(pass, false, 'should not have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator: expected (RegExp)', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const error = new Error('Totally expected error');
	const regexp = /^totally/i;
	const {operator, description, pass, expected, actual} = a.throws(() => {
		throw error;
	}, regexp);
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'should throw', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(expected, '/^totally/i');
	t.equal(actual, error);
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator: expected (RegExp, failed)', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const error = new Error('Not the expected error');
	const regexp = /^totally/i;
	const {operator, description, pass, expected, actual} = a.throws(() => {
		throw error;
	}, regexp);
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'should throw', 'should have the default description');
	t.equal(pass, false, 'should have passed');
	t.equal(expected, '/^totally/i');
	t.equal(actual, error);
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator: expected (constructor)', t => {
	const items = [];
	const a = assertions(i => items.push(i));

	function CustomError() {
	}

	const error = new CustomError();
	const {operator, description, pass, expected, actual} = a.throws(() => {
		throw error;
	}, CustomError);
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'should throw', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(expected, CustomError);
	t.equal(actual, CustomError);
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('throws operator: expected (constructor, failed)', t => {
	const items = [];
	const a = assertions(i => items.push(i));

	function CustomError() {
	}

	const error = new Error('Plain error');
	const {operator, description, pass, expected, actual} = a.throws(() => {
		throw error;
	}, CustomError);
	t.equal(operator, 'throws', 'should have the operator throws');
	t.equal(description, 'should throw', 'should have the default description');
	t.equal(pass, false, 'should have passed');
	t.equal(expected, CustomError);
	t.equal(actual, Error);
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('doesNotThrow operator', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass, expected, actual} = a.doesNotThrow(() => {
	});
	t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
	t.equal(description, 'should not throw', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(expected, 'no thrown error');
	t.equal(actual, undefined);
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('doesNotThrow operator: change default description', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.doesNotThrow(function () {
	}, 'unexepected error');
	t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
	t.equal(description, 'unexepected error', 'should have the custom description');
	t.equal(pass, true, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('doesNotThrow operator: failure', t => {
	const items = [];
	const a = assertions(i => items.push(i));
	const {operator, description, pass} = a.doesNotThrow(() => {
		throw Error();
	});
	t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
	t.equal(description, 'should not throw', 'should have the default description');
	t.equal(pass, false, 'should have passed');
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

test('doesNotThrow operator: expected (ignored)', t => {
	const items = [];
	const a = assertions(i => items.push(i));

	function CustomError() {
	}

	const {operator, description, pass, expected, actual} = a.doesNotThrow(() => {
	}, CustomError);
	t.equal(operator, 'doesNotThrow', 'should have the operator doesNotThrow');
	t.equal(description, 'should not throw', 'should have the default description');
	t.equal(pass, true, 'should have passed');
	t.equal(expected, 'no thrown error');
	t.equal(actual, undefined);
	t.equal(items.length, 1, 'should have added the assertion');
	t.end();
});

