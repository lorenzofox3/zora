const {spawnSync, spawn} = require('child_process');
const path = require('path');
const test = require('tape');
const {readdirSync, readFileSync} = require('fs');
const node = process.execPath;

const sampleRoot = path.resolve(process.cwd(), './test/samples/cases/');
const files = readdirSync(sampleRoot).filter(f => f.split('.').reverse()[0] === 'js');

for (const f of files) {
    test(`sample output: ${f}`, t => {
        const cp = spawnSync(node, [path.resolve(sampleRoot, f)], {stdio: ['pipe', 'pipe', 'ignore']});
        const actualOutput = cp.stdout.toString().replace(/at:.*/g, 'at:{STACK}');
        const outputFile = `../output/${[f.split('.')[0], 'txt'].join('.')}`;
        const expectedOutput = readFileSync(path.resolve(sampleRoot, outputFile), {encoding: 'utf8'});
        t.equal(actualOutput, expectedOutput);
        t.end();
    });
}

for (const f of files) {
    test(`sample output indented: ${f}`, t => {
        const code = readFileSync(path.resolve(sampleRoot, f), {encoding: 'utf8'});
        const outputFile = path.resolve(sampleRoot, `../output/${[f.split('.')[0], 'indent', 'txt'].join('.')}`);
        const expectedResult = readFileSync(outputFile, {encoding: 'utf8'});

        const fullcode = `${code};test.indent()`;
        let tap = '';

        const cp = spawn(node, [], {cwd: sampleRoot, stdio: 'pipe'});

        cp.stdout.on('data', buff => {
            tap += buff.toString();
        });

        cp.stdout.on('end', () => {
            t.equal(tap
                    .replace(/[0-9]+ms/g, '{TIME}')
                    .replace(/at:.*/g, 'at:{STACK}'),
                expectedResult);
            t.end();
        });
        cp.stdin.write(fullcode);
        cp.stdin.end();
    });
}
