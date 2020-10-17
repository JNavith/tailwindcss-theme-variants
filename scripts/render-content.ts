import {
	mkdir, readdir, readFile, unlink, writeFile,
} from "fs/promises";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- not following the decs.d.ts file for some reason?
import toc from "markdown-toc";

const main = async () => {
	const destination = "./site/src/rendered-content";

	mkdir(destination, { recursive: true });
	const preexisting = await readdir(destination);
	await Promise.all(preexisting.map(async (file) => {
		await unlink(`${destination}/${file}`);
	}));

	const source = "./content";
	const order = [
		"title",
		"intro",
		"installation",
		"basic-usage",
		"full-configuration",
		"examples",
		"semantics",
		"alternatives",
		"license-and-contributing",
		"about-this-site",
	];

	const content = order.map((stem) => readFile(`${source}/${stem}.md`));

	const combined = (await Promise.all(content)).join("\n\n");
	const withEscapedBackslashes = combined.replace(/\\/gm, "\\\\");

	const withEmojisDroppedFromHeadings = withEscapedBackslashes
		.replace("# 🌗 Tailwind CSS Theme Variants", "# Introducing: Theme Variants for Tailwind CSS")
		.replace("# ⬇️", "# ")
		.replace("# 🛠", "# ")
		.replace("# ⚙️", "# ")
		.replace("# 📄", "# ");

	writeFile(`${destination}/site-all.svx`, withEmojisDroppedFromHeadings);
	writeFile(`${destination}/site-toc.svx`, toc(withEmojisDroppedFromHeadings).content);
};

main();
