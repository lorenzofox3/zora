const stringify = JSON.stringify;
const printTestHeader = test => console.log(`# ${test.description} - ${test.executionTime}ms`);
const printTestCase = (assertion, id) => {
	const pass = assertion.pass;
	const status = pass === true ? 'ok' : 'not ok';
	console.log(`${status} ${id} ${assertion.message}`);
	if (pass !== true) {
		console.log(`	---
	operator: ${assertion.operator}					
	expected: ${stringify(assertion.expected)}					
	actual: ${stringify(assertion.actual)}					
	...`);
	}
};
const printSummary = ({count, pass, fail, skipped, executionTime}) => {
	console.log(`
1..${count}
# duration ${executionTime}ms
# tests ${count} (${skipped} skipped)
# pass  ${pass}
# fail  ${fail}
		`);
};

export default ({displaySkipped = true} = {}) => function * () {
	const startTime = Date.now();
	let pass = 0;
	let fail = 0;
	let id = 0;
	let skipped = 0;
	let executionError;
	console.log('TAP version 13');
	try {
		/* eslint-disable no-constant-condition */
		while (true) {
			const test = yield;

			if (test.items.length === 0) {
				skipped++;
			}

			if (test.items.length > 0 || displaySkipped === true) {
				printTestHeader(test);
			}

			for (const assertion of test.items) {
				id++;
				if (assertion.pass === true) {
					pass++;
				} else {
					fail++;
				}
				printTestCase(assertion, id);
			}
		}
		/* eslint-enable no-constant-condition */
	} catch (err) {
		console.log('Bail out! unhandled exception');
		executionError = err;
	} finally {
		const executionTime = Date.now() - startTime;
		printSummary({count: id, executionTime, skipped, pass, fail});
	}

	if (executionError) {
		throw executionError; // Environments see unhandled error (exit a process with a valid code)
	}

	if (fail > 0) {
		throw new Error('Some tests have failed. See report above'); // Environments see the process has failed (exit a process with a valid code)
	}
};
