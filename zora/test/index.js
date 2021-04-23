import {test} from '../dist/index.js';

const wait = (time = 100) => new Promise((resolve) => {
    setTimeout(() => {
        resolve();
    }, time);
});

test('some test', async ({eq, test}) => {
    let counter = 0;
    eq(counter, 0);
    
    counter++;
    eq(counter, 1, 'some comment');
    
    test('sub doo', async ({eq}) => {
        await wait(300);
        counter++;
        eq(counter, 3);
        eq(counter, 66, 'the failing one');
    });
    
    eq(counter, 1);
    
    await test('sub serial', async ({eq}) => {
        await wait();
        counter++;
        eq(counter, 2, 'here as well');
    });
    
    eq(counter, 2);
});

test.skip('should be skipped', ({fail}) => {
    fail('blah');
});

// zora
//     .report()
//     .then(() => {
//         console.log('done');
//     });
