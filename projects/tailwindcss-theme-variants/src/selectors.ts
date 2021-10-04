import parser, {
	Node, Root,
} from "postcss-selector-parser";

export const parse = (selector: string): Root => {
	let container: Root;

	const processor = parser((container_) => {
		container = container_;
	});
	processor.processSync(selector);

	return container!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
};

export const unparse = (node: Node): string => node.toString();

export const addParent = (selector: string, parent: string): string => {
	if (!parent) return selector;

	const parsedSelector = parse(selector);
	const parts = parsedSelector.split((node) => node.type === "selector" || node.type === "combinator");
	const unparsedParts = parts.map((part) => unparse(part[0])).flat();
	return unparsedParts.map((part) => `${parent} ${part.trim()}`).join(", ");
};
