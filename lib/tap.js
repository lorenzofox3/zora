const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + (offset * 4))); // 4 white space used as indent (see tap-parser)
};

const toYaml = print => (obj, offset = 0) => {
	for (const [prop, value] of Object.entries(obj)) {
		print(`${prop}: ${JSON.stringify(value)}`, offset + 0.5);
	}
};

const tap = print => {
	const yaml = toYaml(print);
	return {
		version(version = 13) {
			print(`TAP version ${version}`);
		},
		title(value, offset = 0) {
			const message = offset > 0 ? `Subtest: ${value}` : value;
			this.comment(message, offset);
		},
		assert(value, offset = 0) {
			const {pass, description, id, executionTime, expected = '', actual = '', at = '', operator = ''} = value;
			const label = pass === true ? 'ok' : 'not ok';
			print(`${label} ${id} - ${description}${executionTime ? ` # time=${executionTime}ms` : ''}`, offset);
			if (pass === false && value.operator) {
				print('---', offset + 0.5);
				yaml({expected, actual, at, operator}, offset);
				print('...', offset + 0.5);
			}
		},
		plan(value, offset = 0) {
			print(`1..${value.end}`, offset);
		},
		time(value, offset = 0) {
			this.comment(`time=${value}ms`, offset);
		},
		comment(value, offset = 0) {
			print(`# ${value}`, offset);
		},
		bailout(value = 'Unhandled exception') {
			print(`Bail out! ${value}`);
		},
		testAssert(value, offset = 0) {
			return this.assert(value, offset);
		}
	};
};

export default (printFn = print) => {
	const reporter = tap(printFn);
	return (toPrint = {}) => {
		const {data, type, offset = 0} = toPrint;
		if (typeof reporter[type] === 'function') {
			reporter[type](data, offset);
		}
		// Else ignore (unknown message type)
	};
};
