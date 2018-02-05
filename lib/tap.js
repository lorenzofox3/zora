const print = (message, offset = 0) => {
	console.log(message.padStart(message.length + offset * 2));
};

export default function printResult(r, offset = 0) {
	const comment = `# ${r.description} - ${r.executionTime}ms`;
	print(comment, offset);
	for (const item of r.testPoints) {
		if (item.testPoints) {
			// Sub test
			printResult(item, offset + 1);
		}
		const toPrint = `${item.pass === true ? 'ok' : 'not ok'} - ${item.description}`;
		print(toPrint, offset);
	}

	if (offset > 0) {
		const plan = `1..${r.testPoints.length}`;
		print(plan, offset);
		print(`# time=${r.executionTime}ms`, offset)
	}
}