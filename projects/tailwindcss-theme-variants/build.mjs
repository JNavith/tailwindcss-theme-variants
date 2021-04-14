import esbuild from "esbuild";
import { readdir } from "fs/promises";
import { dirname, join, resolve } from "path";
import ts from "typescript";
import { fileURLToPath } from "url";

const main = async () => {
	const cd = dirname(fileURLToPath(import.meta.url));
	const srcDir = resolve(cd, "src");
	const filesInSrc = await readdir(srcDir);
	const srcFiles = filesInSrc.map((file) => join("src/", file));
	const tsSrcFiles = srcFiles.filter((file) => file.endsWith(".ts"));

	const esbuildOptions = {
		entryPoints: srcFiles,
		minify: true,
		outdir: ".",
		platform: "node",
	};
	const esbuildProcess = esbuild.build({
		...esbuildOptions,
		format: "cjs",
		target: "node12",
		outExtension: {
			".js": ".js",
		},
	});

	const configFileName = ts.findConfigFile(
		"./",
		ts.sys.fileExists,
		"tsconfig.json",
	);
	const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
	const tsOptions = ts.parseJsonConfigFileContent(
		configFile.config,
		ts.sys,
		"./",
	);

	const program = ts.createProgram(tsSrcFiles, {
		...tsOptions.options,
		declaration: true,
		emitDeclarationOnly: true,
		outDir: ".",
	});

	const emitResult = program.emit();

	const allDiagnostics = ts
		.getPreEmitDiagnostics(program)
		.concat(emitResult.diagnostics);

	allDiagnostics.forEach((diagnostic) => {
		if (diagnostic.file) {
			const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
			const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
			console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
		} else {
			console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
		}
	});

	await esbuildProcess;
};

main();
