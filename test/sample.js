const test = require('../dist/'); // todo
const util = require('util');

const sleep = (time) => new Promise(resolve => {
	setTimeout(function () {
		resolve();
	}, time);
});
const testSuite = test('my test', t => {
	// t.test('assertions', (t) => {
	// assert.equal('foo', 'foo');
	// assert.equal('foo', 'bar');
	t.deepEqual({foo: 'bar'}, {foo: 'bar'}, 'hey hey hey');
	// assert.deepEqual({foo: 'bar'}, 'foo');
	// assert.ok(true);
	// assert.ok(false);
	// assert.fail('wanted to fail');
	// })
	t.test('nested', async t => {
		t.equal('foo', 'foo', 'before waiting');
		await sleep(200);

		t.test('more inside',async t => {
			await sleep(100);
			t.equal('sure','sure','sure');
		});

		t.equal(10, 10, 'counter strike');
	});

	t.test('another async', async t => {
		await sleep(300);
		t.equal(42, 42, 'the answer');
	})

});
// .skip('async test', async (assert) => {
// 	const p = new Promise(function (resolve) {
// 		setTimeout(function () {
// 			resolve('foo');
// 		}, 200)
// 	});
//
// 	const val = await p;
// 	assert.equal(val, 'foo', 'should have passed an async test');
// })
// .skip('async test', async (assert) => {
// 	const p = new Promise(function (resolve) {
// 		setTimeout(function () {
// 			resolve('foo');
// 		}, 100)
// 	});
//
// 	const val = await p;
// 	assert.equal(val, 'foo', 'should have passed an async test');
// });

const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + offset * 2));
};

function printResult(r, offset = 0) {
	const comment = `# ${r.description} - ${r.executionTime}ms`;
	print(comment, offset);
	for (const item of r.items) {
		if (item.items) {
			printResult(item, offset + 1);
			item.pass = item.items.every(t => t.pass === true);
			item.message = item.description;
			// subtest
		}
		const toPrint = `${item.pass === true ? 'ok' : 'not ok'} - ${item.message}`;
		print(toPrint, offset);
	}
	const plan = `1..${r.items.length}`;
	print(plan, offset);
}


testSuite
	.run()
	.then(printResult);


// const printItems = function * (t) {
// 	for (const i of t.items) {
// 		if (i.items) {
// 			yield * printItems(i);
// 		} else {
// 			console.log(inspect(i));
// 		}
// 	}
// };
//
//
// plan.run(function * () {
// 	while (true) {
// 		const t = yield;
// 		yield * printItems(t);
// 	}
// });