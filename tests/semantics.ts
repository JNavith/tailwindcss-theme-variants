import { describe, it } from "mocha";

import thisPlugin, { prefersDark, prefersLight } from "../src/index";
import { assertContainsCSS, generatePluginCSS } from "./_utils";

export const semantics = (): void => {
	describe("semantics", () => {
		it("background color with constants", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					target: "ie11",

					theme: {
						colors: {
							white: "#FF",
							gray: {
								100: "#EE",
								800: "#22",
								900: "#11",
							},
						},
					},
					corePlugins: ["backgroundColor"],
					variants: {
						backgroundColor: ["themes"],
					},

					plugins: [
						thisPlugin({
							group: "themes",
							baseSelector: "html",
							themes: {
								light: {
									mediaQuery: prefersLight,
									semantics: {
										colors: {
											primary: "white",
											"on-primary": "gray-800",
										},
									},
								},
								dark: {
									mediaQuery: prefersDark,
									semantics: {
										colors: {
											primary: "gray-900",
											"on-primary": "gray-100",
										},
									},
								},
							},
						}),
					],
				},
			),
			[
				`
					@media (prefers-color-scheme: light) {
						.bg-primary {
							background-color: #FF;
						}
					}
					@media (prefers-color-scheme: dark) {
						.bg-primary {
							background-color: #11;
						}
					}

					@media (prefers-color-scheme: light) {
						.bg-on-primary {
							background-color: #22;
						}
					}
					@media (prefers-color-scheme: dark) {
						.bg-on-primary {
							background-color: #EE;
						}
					}
				`,
			]);
		});
	});
};
