const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const outputDir = path.join(__dirname, "outputs");

// Function to run 'melt -v' and log the output
function logMeltVersion() {
	try {
		const result = child_process.execSync(`melt -v`);
		return Buffer.from(result).toString("utf-8");
	} catch (error) {
		return Buffer.from(error.output[1]).toString("utf-8");
	}
}

// Log melt version on server startup
console.log("init log!!!", logMeltVersion());

// Basic endpoint to verify the server is running
app.get("/write", (req, res) => {
	fs.mkdirSync(outputDir, { recursive: true });
	const result = fs.writeFileSync(path.join(outputDir, "file.txt"), "input!!!");

	res.send({ result });
});
app.get("/read", (req, res) => {
	const result = fs.readFileSync(path.join(outputDir, "file.txt"), {
		encoding: "utf-8",
	});
	console.log({ result });

	res.json({ result });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
