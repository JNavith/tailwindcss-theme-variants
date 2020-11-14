declare module "markdown-toc";
declare module "remark-retext";
declare module "retext-english";
declare module "retext-passive";

declare module "tailwindcss";
declare module "tailwindcss/plugin" {
	import { CreatePlugin } from "@navith/tailwindcss-plugin-author-types";

	const createPlugin: CreatePlugin;
	export = createPlugin;
}
declare module "tailwindcss/lib/util/withAlphaVariable" {
	const withAlphaVariable: ({ color, property, variable }: { color: string, property: string, variable: string }) => string;
	export default withAlphaVariable;
	export const toRgba: (color: string) => [number, number, number, number];
}

declare module "to-vfile";
declare module "vfile-reporter";
