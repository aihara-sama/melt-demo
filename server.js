const child_process = require("child_process");

try {
	child_process.execSync(`melt -v`);
} catch (error) {
	console.log(Buffer.from(error.output[1]).toString("utf-8"));
}
