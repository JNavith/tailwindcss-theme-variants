const esbuild = require("esbuild");
const { promises } = require("fs");
const { join, resolve } = require("path");

const { readdir } = promises;

const main = async () => {
	const srcFiles = await readdir(resolve(__dirname, "../src"));
	const options = {
		entryPoints: srcFiles.map((srcFile) => join("src/", srcFile)),
		minify: true,
		outdir: "dist",
		platform: "node",
	};

	await esbuild.build({
		...options,
		format: "cjs",
		target: "node12",
		outExtension: {
			".js": ".js",
		},
	});
};

main();
