import { readFile, writeFile } from "fs/promises";

const contentOrder = [
	"title",
	"intro",
	"installation",
	"basic-usage",
	"full-configuration",
	"examples",
	"semantics",
	"alternatives",
	"license-and-contributing",
	"about-this-repository",
];

const main = async () => {
	const content = contentOrder.map((stem) => readFile(`./content/${stem}.md`));

	const combined = (await Promise.all(content)).join("\n\n");

	writeFile("./README.md", combined);
};

main();
