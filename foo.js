const {ok, skip, test} = require('./dist/bundle/index');
ok(false, 'hey hey');
ok(true, 'hey hey bis');

// const test = require('tape');
//
// test('foo', t=>{
//     t.ok(false);
//     t.ok(true);
//     t.end();
// });
