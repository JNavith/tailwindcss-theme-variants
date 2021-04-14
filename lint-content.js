import { readdir } from "fs/promises";
import vfile from "to-vfile";
import report from "vfile-reporter";
import unified from "unified";
import parse from "remark-parse";
import stringify from "remark-stringify";
import remark2retext from "remark-retext";
import english from "retext-english";
import passive from "retext-passive";
import readability from "retext-readability";

const source = "./content";

const analyzer = unified()
	.use(parse)
	.use(
		remark2retext,
		unified()
			.use(english)
			.use(passive)
			.use(readability, {
				age: 20,
				threshold: 4 / 7,
			}),
	)
	.use(stringify);

const main = async () => {
	const files = await readdir(source);

	let errored = false;
	await Promise.all(files.map(async (path) => {
		const content = await vfile.read(`${source}/${path}`);

		analyzer.process(content, (error, file) => {
			if (error) {
				console.error(report(error));
				errored = true;
			} else {
				console.log(report(file));
			}
		});
	}));

	if (errored) process.exit(1);
};

main();
