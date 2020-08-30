import { TailwindCSSConfig } from "@navith/tailwindcss-plugin-author-types";
import assert from "assert";
import cssMatcher from "jest-matcher-css";
import { merge } from "lodash";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

export const generatePluginCSS = (config: TailwindCSSConfig, css?: string): Promise<string> => postcss(
	tailwindcss(
		merge({
			theme: {},
			corePlugins: false,
			future: {
				removeDeprecatedGapUtilities: true,
			},
		} as TailwindCSSConfig, config),
	),
).process(css ?? "@tailwind utilities", {
	from: undefined,
}).then((result) => result.css);

export const assertExactCSS = (actual: string, expected: string): void => {
	const { pass, message }: {pass: boolean, message: () => string} = cssMatcher(actual, expected);
	assert.ok(pass, message());
};
