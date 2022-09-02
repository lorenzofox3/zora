import {test, only} from '../../../dist/bundle/module.js';

test('should not run', t => {
    t.fail('I should not run ');
});

only('should run', t => {
    t.ok(true, 'I ran');

    t.only('keep running', t => {
        t.only('keeeeeep running', t => {
            t.ok(true, ' I got there');
        });
    });

    t.test('should not run', t => {
        t.fail('shouldn ot run');
    });
});

only('should run but nothing inside', t => {
    t.test('will not run', t => {
        t.fail('should not run');
    });
    t.test('will not run', t => {
        t.fail('should not run');
    });
});
