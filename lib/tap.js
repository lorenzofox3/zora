const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + offset * 4)); // 4 white space used as indent (see tap-parser)
};

const tap = {
	version(version = 13, offset = 0) {
		print(`TAP version ${version}`, offset);
	},
	title(value, offset = 0) {
		const message = offset > 0 ? `Subtest: ${value}` : value;
		this.comment(message, offset);
	},
	assert(value, offset = 0) {
		const {pass, description, id} = value;
		const label = pass === true ? 'ok' : 'not ok';
		print(`${label} ${id} - ${description}`, offset);
	},
	plan(value, offset = 0) {
		print(`1..${value.end}`, offset);
	},
	time(value, offset = 0) {
		this.comment(`time=${value}ms`, offset);
	},
	comment(value, offset = 0) {
		print(`# ${value}`, offset);
	}
};

export default (toPrint = {}) => {
	const {data, type, offset = 0,} = toPrint;
	if (typeof tap[type] === 'function') {
		tap[type](data, offset);
	}
	// Else ignore (unknown message type)
};