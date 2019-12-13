const {spawnSync} = require('child_process');
const path = require('path');
const test = require('tape');
const {readdirSync, readFileSync} = require('fs');
const node = process.execPath;

const sampleRoot = path.resolve(process.cwd(), './test/samples/cases/');
const files = readdirSync(sampleRoot)
    .filter(f => f.split('.').reverse()[0] === 'js' && f !== 'late_collect.js'); // late collect will be checked separately

for (const f of files) {
    test(`sample output: ${f}`, t => {
        const cp = spawnSync(node, ['-r', 'esm', f], {
            cwd: sampleRoot,
            stdio: ['pipe', 'pipe', 'ignore'],
            env: {RUN_ONLY: f.startsWith('only')}
        });
        const actualOutput = cp.stdout.toString()
            .replace(/at:.*/g, 'at:{STACK}');
        const outputFile = `../output/${[f.split('.')[0], 'txt'].join('.')}`;
        const expectedOutput = readFileSync(path.resolve(sampleRoot, outputFile), {encoding: 'utf8'});
        t.equal(actualOutput, expectedOutput);
        t.end();
    });

    test(`sample output indented: ${f}`, t => {
        const cp = spawnSync(node, ['-r', 'esm', f], {
            cwd: sampleRoot,
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                RUN_ONLY: f.startsWith('only'),
                INDENT: true
            }
        });
        const actualOutput = cp.stdout.toString()
            .replace(/at:.*/g, 'at:{STACK}')
            .replace(/[0-9]+ms/g, '{TIME}');
        const outputFile = `../output/${[f.split('.')[0], 'indent', 'txt'].join('.')}`;
        const expectedOutput = readFileSync(path.resolve(sampleRoot, outputFile), {encoding: 'utf8'});
        t.equal(actualOutput, expectedOutput);
        t.end();
    });
}

test(`late collect should report an error on stderr`, t => {
    const cp = spawnSync(node, ['-r', 'esm', 'late_collect.js'], {
        cwd: sampleRoot,
        stdio: ['pipe', 'pipe', 'pipe']
    });
    const actualOutput = cp.stderr.toString();
    t.ok(actualOutput.startsWith(`Error: test "late collection" 
tried to collect an assertion after it has run to its completion. 
You might have forgotten to wait for an asynchronous task to complete
------
async t => {
    t.ok(true);

    setTimeout(() => {
        t.ok(true);
    }, 50);
}`));
    t.end();
});