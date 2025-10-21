const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;
const outputDir = path.join(__dirname, "output");
fs.mkdirSync(outputDir, { recursive: true });

app.use(cors());

app.use(express.static("public"));
app.use("/output", express.static("output")); // Serve files from output folder

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "output/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + file.originalname);
	},
});

const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "video/mp4") {
			cb(null, true);
		} else {
			cb(new Error("Only MP4 files are allowed"), false);
		}
	},
});

app.post("/upload", upload.single("video"), (req, res) => {
	if (!req.file) {
		return res
			.status(400)
			.json({ error: "No file uploaded or invalid file type" });
	}
	res.json({
		message: "File uploaded successfully",
		filename: req.file.filename,
	});
});

// Function to run 'melt -v' and log the output
function logMeltVersion() {
	try {
		const result = child_process.execSync(`melt -v`);
		return Buffer.from(result).toString("utf-8");
	} catch (error) {
		return Buffer.from(error.output[1]).toString("utf-8");
	}
}
function logLs() {
	try {
		const result = child_process.execSync(`ls`);
		return Buffer.from(result).toString("utf-8");
	} catch (error) {
		return Buffer.from(error.output[1]).toString("utf-8");
	}
}

// Log melt version on server startup
console.log("init log!!!", logMeltVersion());

// Basic endpoint to verify the server is running
app.get("/write", (req, res) => {
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
app.get("/ls", (req, res) => {
	const result = logLs();
	console.log({ result });

	res.json({ result });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
