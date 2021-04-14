declare module "tailwindcss";
declare module "tailwindcss/plugin" {
	import { CreatePlugin } from "@navith/tailwindcss-plugin-author-types";

	const createPlugin: CreatePlugin;
	export = createPlugin;
}
