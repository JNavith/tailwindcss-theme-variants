import { describe, it } from "mocha";
import { createSandbox } from "sinon";

import thisPlugin, { prefersDark, prefersLight } from "../src/index";
import { assertContainsCSS, generatePluginCSS, onTailwind2 } from "./_utils";

export const semantics = (): void => {
	describe("semantics", () => {
		it("background color with constants (1.x) or with variables (2.x)", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

			const generated = await generatePluginCSS(
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
				"@tailwind base;\n@tailwind utilities;",
			);

			if (onTailwind2(consoleStub.getCalls())) {
				assertContainsCSS(generated, [
					`
					@media (prefers-color-scheme: light) {
						html {
							--primary: #FF;
							--on-primary: #22;
						}
					}

					@media (prefers-color-scheme: dark){
						html {
							--primary: #11;
							--on-primary: #EE;
						}
					}
				`,
					`
					.bg-primary {
						background-color: rgb(var(--primary));
					}

					.bg-on-primary {
						background-color: rgb(var(--on-primary));
					}
				`,
				]);
			} else {
				assertContainsCSS(generated, [
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
			}

			sandbox.restore();
		});

		it("text color with constants (1.x) or with variables (2.x) with hover variants", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

			const generated = await generatePluginCSS(
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
				"@tailwind base;\n@tailwind utilities;",
			);

			if (onTailwind2(consoleStub.getCalls())) {
				assertContainsCSS(generated, [
					`
						:root:not(.green-theme) {
							--primary: 68, 0, 0;
							--accent: 102, 0, 102;
						}

						:root.red-theme {
							--primary: 68, 0, 0;
							--accent: 102, 0, 102;
						}

						:root.green-theme {
							--primary: 0, 68, 0;
							--accent: 0, 102, 102;
						}
					`,
					`
						.text-primary {
							color: rgb(var(--primary));
						}

						.hover\\:text-primary:hover {
							color: rgb(var(--primary));
						}

						.text-accent {
							color: rgb(var(--accent));
						}

						.hover\\:text-accent:hover {
							color: rgb(var(--accent));
						}
					`,
				]);
			} else {
				assertContainsCSS(generated, [
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
			}

			sandbox.restore();
		});

		it("divide color and opacity with modern target", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					target: "modern",
					theme: {
						colors: {
							yellow: {
								200: "#DD0",
							},
							purple: {
								600: "#606",
							},
						},
						divideOpacity: {
							50: "0.5",
							100: "1",
						},
					},
					corePlugins: ["divideColor", "divideOpacity"],
					variants: {
						divideColor: [],
						divideOpacity: [],
					},

					plugins: [
						thisPlugin({
							group: "seasons",
							fallback: "compact",
							themes: {
								fall: {
									mediaQuery: prefersDark,
									semantics: {
										divideColor: {
											primary: "purple-600",
											accent: "yellow-200",
										},
									},
								},
								spring: {
									mediaQuery: prefersLight,
									semantics: {
										divideColor: {
											primary: "yellow-200",
											accent: "purple-600",
										},
									},
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			),
			[
				`
					:root {
						--primary: 102, 0, 102;
						--accent: 221, 221, 0;
					}

					@media (prefers-color-scheme: light) {
						:root {
							--primary: 221, 221, 0;
							--accent: 102, 0, 102;
						}
					}
				`,

				`
					.divide-primary > :not(template) ~ :not(template) {
						--divide-opacity: 1;
						border-color: rgba(var(--primary), var(--divide-opacity));
					}

					.divide-accent > :not(template) ~ :not(template) {
						--divide-opacity: 1;
						border-color: rgba(var(--accent), var(--divide-opacity));
					}
				`,
			]);
		});

		it("flattens nested configurations", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					target: "modern",

					theme: {
						colors: {
							blue: {
								100: "#00F",
								400: "#009",
								500: "#008",
								600: "#007",
								900: "#002",
							},
							orange: {
								100: "#F80",
								400: "#950",
								500: "#840",
								600: "#730",
								900: "#210",
							},
						},
					},
					corePlugins: ["backgroundColor"],
					variants: {
						backgroundColor: [],
					},

					plugins: [
						thisPlugin({
							group: "colors",
							baseSelector: "body",
							fallback: "compact",
							themes: {
								blue: {
									selector: ".blue-theme",
									semantics: {
										colors: {
											primary: {
												faint: {
													400: "blue-100",
													default: "blue-400",
												},
												default: "blue-500",
												strong: {
													default: "blue-600",
													400: "blue-900",
												},
											},
										},
									},
								},
								orange: {
									selector: ".orange-theme",
									semantics: {
										colors: {
											primary: {
												faint: {
													400: "orange-100",
													default: "orange-400",
												},
												default: "orange-500",
												strong: {
													default: "orange-600",
													400: "orange-900",
												},
											},
										},
									},
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			),
			[
				`
					body {
						--primary-faint-400: 0, 0, 255;
						--primary-faint: 0, 0, 153;
						--primary: 0, 0, 136;
						--primary-strong-400: 0, 0, 34;
						--primary-strong: 0, 0, 119;
					}

					body.orange-theme {
						--primary-faint-400: 255, 136, 0;
						--primary-faint: 153, 85, 0;
						--primary: 136, 68, 0;
						--primary-strong-400: 34, 17, 0;
						--primary-strong: 119, 51, 0;
					}
				`,

				`
					.bg-primary-faint-400 {
						background-color: rgb(var(--primary-faint-400));
					}

					.bg-primary-faint {
						background-color: rgb(var(--primary-faint));
					}

					.bg-primary {
						background-color: rgb(var(--primary));
					}

					.bg-primary-strong-400 {
						background-color: rgb(var(--primary-strong-400));
					}

					.bg-primary-strong {
						background-color: rgb(var(--primary-strong));
					}
				`,
			]);
		});

		it("gradient color stops with modern target", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					target: "modern",
					theme: {
						colors: {
							yellow: {
								200: "#DD0",
							},
							purple: {
								600: "#606",
							},
						},
					},
					corePlugins: ["gradientColorStops"],
					variants: {
						gradientColorStops: [],
					},

					plugins: [
						thisPlugin({
							fallback: "compact",
							themes: {
								day: {
									mediaQuery: prefersLight,
									semantics: {
										colors: {
											primary: "yellow-200",
											accent: "purple-600",
										},
									},
								},
								night: {
									mediaQuery: prefersDark,
									semantics: {
										colors: {
											primary: "purple-600",
											accent: "yellow-200",
										},
									},
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			),
			[
				`
					:root {
						--primary: 221, 221, 0;
						--accent: 102, 0, 102;
					}

					@media (prefers-color-scheme: dark) {
						:root {
							--primary: 102, 0, 102;
							--accent: 221, 221, 0;
						}
					}
				`,

				`
					.from-primary {
						--gradient-from-color: rgb(var(--primary));
						--gradient-color-stops: var(--gradient-from-color), var(--gradient-to-color, rgba(var(--primary), 0));
					}
					.from-accent {
						--gradient-from-color: rgb(var(--accent));
						--gradient-color-stops: var(--gradient-from-color), var(--gradient-to-color, rgba(var(--accent), 0));
					}
					.via-primary {
						--gradient-via-color: rgb(var(--primary));
						--gradient-color-stops: var(--gradient-from-color), var(--gradient-via-color), var(--gradient-to-color, rgba(var(--primary), 0));
					}
					.via-accent {
						--gradient-via-color: rgb(var(--accent));
						--gradient-color-stops: var(--gradient-from-color), var(--gradient-via-color), var(--gradient-to-color, rgba(var(--accent), 0));
					}
					.to-primary {
						--gradient-to-color: rgb(var(--primary));
					}
					.to-accent {
						--gradient-to-color: rgb(var(--accent));
					}
				`,
			]);
		});

		it("supports non-color utilities (font family) with modern target", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					target: "modern",
					theme: {
						fontFamily: {
							slab: ["\"Roboto Slab\"", "\"Times New Roman\""],
							serif: ["\"Times New Roman\"", "\"Roboto Slab\""],
							sans: ["Inter", "Poppins"],
							display: ["Poppins", "Inter"],
						},
					},
					corePlugins: ["fontFamily"],
					variants: {
						fontFamily: [],
					},

					plugins: [
						thisPlugin({
							fallback: "compact",
							themes: {
								simple: {
									selector: ".sophisticated",
									semantics: {
										fontFamily: {
											heading: "display",
											body: "sans",
										},
									},
								},
								sophisticated: {
									selector: ".simple",
									semantics: {
										fontFamily: {
											heading: "slab",
											body: "serif",
										},
									},
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			),
			[
				`
					:root {
						--heading: Poppins, Inter;
						--body: Inter, Poppins;
					}

					:root.simple {
						--heading: "Roboto Slab", "Times New Roman";
						--body: "Times New Roman", "Roboto Slab";
					}
				`,

				`
					.font-heading {
						font-family: var(--heading);
					}

					.font-body {
						font-family: var(--body);
					} 
				`,
			]);
		});

		it("supports user-defined utilities with modern target", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					target: "modern",
					theme: {
						backgroundBlendMode: {
							overlay: "overlay",
							multiply: "multiply",
						},
					},
					corePlugins: [],
					variants: {
						backgroundBlendMode: [],
					},

					plugins: [
						thisPlugin({
							fallback: "compact",
							themes: {
								darken: {
									selector: "[data-blend=darken]",
									semantics: {
										backgroundBlendMode: {
											standard: "multiply",
										},
									},
								},
								shine: {
									selector: "[data-blend=shine]",
									semantics: {
										backgroundBlendMode: {
											standard: "overlay",
										},
									},
								},
							},
							utilities: {
								backgroundBlendMode: {
									configKey: "backgroundBlendMode",
									prefix: "bg-blend",
									isColorUtility: false,
									css: ({ computedClass, computedValue }) => ({
										[computedClass]: {
											backgroundBlendMode: computedValue,
										},
									}),
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			),
			[
				`
					:root {
						--standard: multiply;
					}

					:root[data-blend=shine] {
						--standard: overlay;
					}
				`,

				`
					.bg-blend-standard {
						background-blend-mode: var(--standard);
					}
				`,
			]);
		});
	});
};
