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
						backgroundColor: ["light", "dark"],
					},

					plugins: [
						thisPlugin({
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
				`,

				`
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

		it("text color with constants with hover variants", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					target: "ie11",

					theme: {
						colors: {
							green: {
								800: "#040",
							},
							teal: {
								600: "#066",
							},
							pink: {
								600: "#606",
							},
							red: {
								800: "#400",
							},
						},
					},
					corePlugins: ["textColor"],
					variants: {
						textColor: ["colors", "hover"],
					},

					plugins: [
						thisPlugin({
							group: "colors",
							fallback: true,
							themes: {
								red: {
									selector: ".red-theme",
									semantics: {
										textColor: {
											primary: "red-800",
											accent: "pink-600",
										},
									},
								},
								green: {
									selector: ".green-theme",
									semantics: {
										textColor: {
											primary: "green-800",
											accent: "teal-600",
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
					:root:not(.green-theme) .text-primary {
						color: #400;
					}
					:root.red-theme .text-primary {
						color: #400;
					}
					:root.green-theme .text-primary {
						color: #040;
					}
				`,
				`
					:root:not(.green-theme) .text-accent {
						color: #606;
					}
					:root.red-theme .text-accent {
						color: #606;
					}
					:root.green-theme .text-accent {
						color: #066;
					}
				`,
				`
					:root:not(.green-theme) .hover\\:text-primary:hover {
						color: #400;
					}
					:root.red-theme .hover\\:text-primary:hover {
						color: #400;
					}
					:root.green-theme .hover\\:text-primary:hover {
						color: #040;
					}
				`,
				`
					:root:not(.green-theme) .hover\\:text-accent:hover {
						color: #606;
					}
					:root.red-theme .hover\\:text-accent:hover {
						color: #606;
					}
					:root.green-theme .hover\\:text-accent:hover {
						color: #066;
					}
				`,
			]);
		});
	});
};
