import { readdir } from "fs/promises";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
import vfile from "to-vfile";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
import report from "vfile-reporter";
import unified from "unified";
import parse from "remark-parse";
import stringify from "remark-stringify";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
import remark2retext from "remark-retext";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
import english from "retext-english";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
import passive from "retext-passive";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
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
	await Promise.all(files.map(async (path) => {
		const content = await vfile.read(`${source}/${path}`);

		analyzer.process(content, (err, file) => {
			console.error(report(err || file));
		});
	}));
};

main();
