const child_process = require("child_process");

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Function to run 'melt -v' and log the output
function logMeltVersion() {
	try {
		child_process.execSync(`melt -v`);
	} catch (error) {
		return Buffer.from(error.output[1]).toString("utf-8");
	}
}

// Log melt version on server startup
console.log(logMeltVersion());

// Basic endpoint to verify the server is running
app.get("/", (req, res) => {
	res.send(logMeltVersion());
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
