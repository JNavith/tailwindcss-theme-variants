import { describe, it } from "mocha";

import thisPlugin, { prefersDark, prefersLight } from "../src/index";
import { assertCSS, generatePluginCss } from "./_utils";

export const semantics = (): void => {
	describe("semantics", () => {
		it("background color", async () => {
			assertCSS(await generatePluginCss(
				{
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
			`
				.bg-white{
					background-color: #FF
				}
				.bg-gray-100{
					background-color: #EE
				}
				.bg-gray-800{
					background-color: #22
				}
				.bg-gray-900{
					background-color: #11
				}

				@media (prefers-color-scheme: light){
					.light\\:bg-white{
						background-color: #FF
					}
					.light\\:bg-gray-100{
						background-color: #EE
					}
					.light\\:bg-gray-800{
						background-color: #22
					}
					.light\\:bg-gray-900{
						background-color: #11
					}
				}

				@media (prefers-color-scheme: dark){
					.dark\\:bg-white{
						background-color: #FF
					}
					.dark\\:bg-gray-100{
						background-color: #EE
					}
					.dark\\:bg-gray-800{
						background-color: #22
					}
					.dark\\:bg-gray-900{
						background-color: #11
					}
				}

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
			`);
		});
	});
};
