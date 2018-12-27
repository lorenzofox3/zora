import test from 'tape';
import tap from '../lib/tap';

const reporter = () => {
	const lines = [];
	const print = (value, offset = 0) => lines.push({value, offset});
	const report = tap(print);
	report.lines = lines;
	return report;
};

test('tap version', t => {
	const r = reporter();
	r({type: 'version'});
	t.deepEqual(r.lines, [{value: 'TAP version 13', offset: 0}]);
	t.end();
});

test('tap version with offset', t => {
	const r = reporter();
	r({type: 'version', offset: 666});
	t.deepEqual(r.lines, [{value: 'TAP version 13', offset: 0}]);
	t.end();
});

test('tap title', t => {
	const r = reporter();
	r({type: 'title', data: 'hello world'});
	t.deepEqual(r.lines, [{value: '# hello world', offset: 0}]);
	t.end();
});

test('tap title with offset', t => {
	const r = reporter();
	r({type: 'title', data: 'hello world', offset: 2});
	t.deepEqual(r.lines, [{value: '# Subtest: hello world', offset: 2}]);
	t.end();
});

test('tap passing assert', t => {
	const r = reporter();
	r({type: 'assert', data: {description: 'hello world', pass: true, id: 4}, offset: 0});
	t.deepEqual(r.lines, [{value: 'ok 4 - hello world', offset: 0}]);
	t.end();
});

test('tap passing assert with time comment', t => {
	const r = reporter();
	r({type: 'assert', data: {description: 'hello world', pass: true, id: 4, executionTime: 666}, offset: 2});
	t.deepEqual(r.lines, [{value: 'ok 4 - hello world # time=666ms', offset: 2}]);
	t.end();
});

test('tap failing assert with no diagnostic', t => {
	const r = reporter();
	r({type: 'assert', data: {description: 'hello world', pass: false, id: 4}, offset: 0});
	t.deepEqual(r.lines, [{value: 'not ok 4 - hello world', offset: 0}]);
	t.end();
});

test('tap failing assert with diagnostic', t => {
	const r = reporter();
	r({
		type: 'assert',
		data: {
			description: 'hello world',
			pass: false,
			operator: '===',
			expected: 'foo',
			actual: 'bar',
			at: 'foo.test.bar.js:5:3',
			id: 4
		},
		offset: 0
	});
	t.deepEqual(r.lines, [
		{value: 'not ok 4 - hello world', offset: 0},
		{value: '---', offset: 0.5},
		{value: 'expected: "foo"', offset: 0.5},
		{value: 'actual: "bar"', offset: 0.5},
		{value: 'at: "foo.test.bar.js:5:3"', offset: 0.5},
		{value: 'operator: "==="', offset: 0.5},
		{value: '...', offset: 0.5}]
	);
	t.end();
});

test('tap plan', t => {
	const r = reporter();
	r({type: 'plan', data: {end: 4}, offset: 0});
	t.deepEqual(r.lines, [{value: '1..4', offset: 0}]);
	t.end();
});

test('tap plan with offset', t => {
	const r = reporter();
	r({type: 'plan', data: {end: 4}, offset: 2});
	t.deepEqual(r.lines, [{value: '1..4', offset: 2}]);
	t.end();
});

test('tap time comment', t => {
	const r = reporter();
	r({type: 'time', data: 666});
	t.deepEqual(r.lines, [{value: '# time=666ms', offset: 0}]);
	t.end();
});

test('tap time comment with offset', t => {
	const r = reporter();
	r({type: 'time', data: 666, offset: 2});
	t.deepEqual(r.lines, [{value: '# time=666ms', offset: 2}]);
	t.end();
});

test('tap comment', t => {
	const r = reporter();
	r({type: 'comment', data: 'foo bar'});
	t.deepEqual(r.lines, [{value: '# foo bar', offset: 0}]);
	t.end();
});

test('tap comment with offset', t => {
	const r = reporter();
	r({type: 'comment', data: 'foo bar', offset:5});
	t.deepEqual(r.lines, [{value: '# foo bar', offset: 5}]);
	t.end();
});

test('tap bailout', t => {
	const r = reporter();
	r({type: 'bailout', data: 'some reason'});
	t.deepEqual(r.lines, [{value: 'Bail out! some reason', offset: 0}]);
	t.end();
});

test('tap bailout with offset', t => {
	const r = reporter();
	r({type: 'bailout', data: 'some reason', offset:4});
	t.deepEqual(r.lines, [{value: 'Bail out! some reason', offset: 0}]);
	t.end();
});

test('tap tester assert', t=>{
	const r = reporter();
	r({type: 'testAssert', data: {description: 'hello world', pass: true, id: 4, executionTime: 666}});
	t.deepEqual(r.lines, [{value: 'ok 4 - hello world # time=666ms', offset: 0}]);
	t.end();
});

test('tap tester assert with offset', t=>{
	const r = reporter();
	r({type: 'testAssert', data: {description: 'hello world', pass: true, id: 4, executionTime: 666}, offset: 2});
	t.deepEqual(r.lines, [{value: 'ok 4 - hello world # time=666ms', offset: 2}]);
	t.end();
});

test('tap ignore unknown message type', t=> {
	const r = reporter();
	r({type: 'whatever', data: 'oh no', offset: 2});
	t.deepEqual(r.lines, []);
	t.end();
});
