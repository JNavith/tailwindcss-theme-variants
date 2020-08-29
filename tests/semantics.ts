import { describe, it } from "mocha";

import thisPlugin from "../src/index";
import { assertCSS, generatePluginCss } from "./_utils";

export const semantics = (): void => {
	describe("semantics", () => {
		it("they exist", async () => {
			assertCSS(await generatePluginCss(
				{
					theme: {},
					corePlugins: [],
					variants: {},

					plugins: [
						thisPlugin({
							themes: {
								light123: {
									selector: ".light-theme",
									semantics: {
										colors: {
											primary: "white",
											"on-primary": "gray.800",
										},
									},
								},
								dark123: {
									selector: ".dark-theme",
									semantics: {
										colors: {
											primary: "gray.900",
											"on-primary": "gray.100",
										},
									},
								},
							},
						}),
					],
				},
			),
			`
                /* ... */
			`);
		});
	});
};
