const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xml2js = require("xml2js");

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

app.post("/upload", upload.single("video"), async (req, res) => {
	if (!req.file) {
		return res
			.status(400)
			.json({ error: "No file uploaded or invalid file type" });
	}

	const videoFolder = `/app/output`;

	const kdenlive = fs.readFileSync(`/app/kdenlive/index.mlt`, "utf8");
	// Parse XML to JS object
	const result = await xml2js.parseStringPromise(kdenlive);

	const filePath = `${videoFolder}/${req.file.filename}`;

	// Set source path
	result.mlt.chain[0].property[2]._ = filePath;
	result.mlt.chain[1].property[2]._ = filePath;
	result.mlt.chain[2].property[2]._ = filePath;

	// Set target path
	result.mlt.consumer[0].$.target = `${videoFolder}/${
		path.parse(filePath).name
	}.webm`;

	const builder = new xml2js.Builder({ headless: true, pretty: true });
	const updatedXml = builder.buildObject(result);

	// Save it back to file
	fs.writeFileSync(`/app/kdenlive/index.mlt`, updatedXml);

	try {
		const result = child_process.execSync(
			`melt -profile atsc_1080p_25 color:0 out=150 "${filePath}" in=0 out=150 in=0 out=150 -filter frei0r.select0r color=0x000000ff invert=1 subspace=0 shape=0.5 edge=0.9 delta_r=0.2 delta_g=0.2 delta_b=0.2 slope=0 operation=0.5 -transition mix a_track=0 b_track=1 always_active=1 sum=1 -transition qtblend a_track=0 b_track=2 always_active=1 -consumer avformat:/app/output/1.webm f=webm vcodec=libvpx-vp9 acodec=libvorbis vb=20M crf=15 pix_fmt=yuva420p aq=4 channels=2 threads=0 real_time=-1`
		);
		console.log({ result });
		return res.json({
			message: "File uploaded successfully",
			result,
		});
	} catch (error) {
		console.log({ error });
		return res.json({
			message: "File uploaded successfully",
			error: Buffer.from(error.stderr).toString(),
		});
	}

	const webmFilename = `${path.parse(filePath).name}.webm`;

	res.json({
		message: "File uploaded successfully",
		result: updatedXml,
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
	const result = __dirname;
	console.log({ result });

	res.json({ result });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
