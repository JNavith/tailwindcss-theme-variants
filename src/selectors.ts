import { flatten } from "lodash";
import parser, {
	Node, Container, Root,
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

const childrenNodesAsStrings = (selector: string): string[] => (parse(selector).nodes[0] as Container).nodes.map(unparse);

const intersection = (...selectors: string[]): string => {
	const [firstSelector, ...otherSelectors] = selectors;

	const node = parse(firstSelector);
	otherSelectors.map(parse).forEach((otherNode) => {
		(node.nodes[0] as Container).append(otherNode as any); // eslint-disable-line @typescript-eslint/no-explicit-any
	});

	return unparse(node);
};

export const distill = (selectors: string[]): [string, string[]] => {
	const [firstSelector, ...otherSelectors] = selectors;

	const commonPartialSelectors = new Set(childrenNodesAsStrings(firstSelector));

	const firstDifferents = new Set<string>();
	const otherDifferents = otherSelectors.map((selector) => [...commonPartialSelectors].reduce((different, partialSelector) => {
		if (different.has(partialSelector)) {
			different.delete(partialSelector);
		} else {
			commonPartialSelectors.delete(partialSelector);
			firstDifferents.add(partialSelector);
		}

		return different;
	}, new Set(childrenNodesAsStrings(selector)))).map((set) => Array.from(set));

	const common = intersection(...commonPartialSelectors);
	const different = flatten([Array.from(firstDifferents), ...otherDifferents]);
	return [common, different];
};

export const addParent = (selector: string, parent: string): string => {
	if (!parent) return selector;

	const parsedSelector = parse(selector);
	const parts = parsedSelector.split((node) => node.type === "selector" || node.type === "combinator");
	const unparsedParts = parts.map((part) => unparse(part[0])).flat();
	return unparsedParts.map((part) => `${parent} ${part.trim()}`).join(", ");
};
