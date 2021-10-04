import { describe, it } from "mocha";
import { createSandbox } from "sinon";

import {
	themeVariants as thisPlugin,
	prefersDark, prefersLight,
} from "tailwindcss-theme-variants/src/index";
import { colorToRgb, rgbToThemeValue } from "tailwindcss-theme-variants/src/theme-and-variable-converters";
import { assertContainsCSS, generatePluginCSS } from "./_utils";

export const semantics = (): void => {
	describe("semantics", () => {
		it("background color", async () => {
			const sandbox = createSandbox();

			const generated = await generatePluginCSS(
				{
					safelist: [
						"bg-primary",
						"bg-on-primary",
					],
					theme: {
						colors: {
							white: "#FFF",
							gray: {
								100: "#EEE",
								800: "#222",
								900: "#111",
							},
						},
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
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			);

			assertContainsCSS(generated, [
				`
					@media (prefers-color-scheme: light) {
						html {
							--primary: 255, 255, 255;
							--on-primary: 34, 34, 34;
						}
					}

					@media (prefers-color-scheme: dark){
						html {
							--primary: 17, 17, 17;
							--on-primary: 238, 238, 238;
						}
					}
				`,
				`
					.bg-primary {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary), var(--tw-bg-opacity));
					}

					.bg-on-primary {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--on-primary), var(--tw-bg-opacity));
					}
				`,
			]);

			sandbox.restore();
		});

		it("background color with a custom prefix", async () => {
			const sandbox = createSandbox();

			const generated = await generatePluginCSS(
				{
					prefix: "custom_prefix_",

					safelist: [
						"custom_prefix_bg-primary",
						"custom_prefix_bg-on-primary",
					],

					theme: {
						colors: {
							white: "#FFF",
							gray: {
								100: "#EEE",
								800: "#222",
								900: "#111",
							},
						},
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
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			);

			assertContainsCSS(generated, [
				`
					@media (prefers-color-scheme: light) {
						html {
							--primary: 255, 255, 255;
							--on-primary: 34, 34, 34;
						}
					}

					@media (prefers-color-scheme: dark){
						html {
							--primary: 17, 17, 17;
							--on-primary: 238, 238, 238;
						}
					}
				`,
				`
					.custom_prefix_bg-primary {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary), var(--tw-bg-opacity));
					}
					
					.custom_prefix_bg-on-primary {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--on-primary), var(--tw-bg-opacity));
					}
				`,
			]);

			sandbox.restore();
		});

		it("text color with hover variants", async () => {
			const sandbox = createSandbox();

			const generated = await generatePluginCSS(
				{
					safelist: [
						"green-theme",
						"text-primary",
						"text-accent",
						"hover:text-primary",
						"hover:text-accent",
					],
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

					plugins: [
						thisPlugin({
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
							utilities: {
								textColor: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			);

			assertContainsCSS(generated, [
				`
					:root {
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
						--tw-text-opacity: 1;
						color: rgba(var(--primary), var(--tw-text-opacity));
					}
					
					.text-accent {
						--tw-text-opacity: 1;
						color: rgba(var(--accent), var(--tw-text-opacity));
					}
				`,

				`
					.hover\\:text-primary:hover {
						--tw-text-opacity: 1;
						color: rgba(var(--primary), var(--tw-text-opacity));
					}
					
					.hover\\:text-accent:hover {
						--tw-text-opacity: 1;
						color: rgba(var(--accent), var(--tw-text-opacity));
					}
				`,
			]);

			sandbox.restore();
		});

		it("text color with a custom prefix with hover variants", async () => {
			const sandbox = createSandbox();

			const generated = await generatePluginCSS(
				{
					prefix: "$tw$",

					safelist: [
						"red-theme",
						"green-theme",
						"$tw$text-primary",
						"$tw$text-accent",
						"hover:$tw$text-primary",
						"hover:$tw$text-accent",
					],

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

					plugins: [
						thisPlugin({
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
							utilities: {
								textColor: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			);

			assertContainsCSS(generated, [
				`
						:root {
							--primary: 68, 0, 0;
							--accent: 102, 0, 102;
						}

						:root.green-theme {
							--primary: 0, 68, 0;
							--accent: 0, 102, 102;
						}
					`,
				`
						.\\$tw\\$text-primary {
							--tw-text-opacity: 1;
							color: rgba(var(--primary), var(--tw-text-opacity));
						}
						
						.\\$tw\\$text-accent {
							--tw-text-opacity: 1;
							color: rgba(var(--accent), var(--tw-text-opacity));
						}
						`,
				`
						.hover\\:\\$tw\\$text-primary:hover {
							--tw-text-opacity: 1;
							color: rgba(var(--primary), var(--tw-text-opacity));
						}
						
						.hover\\:\\$tw\\$text-accent:hover {
							--tw-text-opacity: 1;
							color: rgba(var(--accent), var(--tw-text-opacity));
						}
					`,
			]);

			sandbox.restore();
		});

		it("divide color", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					safelist: [
						"divide-primary",
						"divide-accent",
					],
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

					plugins: [
						thisPlugin({
							fallback: true,
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
							utilities: {
								divideColor: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
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
					.divide-primary > :not([hidden]) ~ :not([hidden]) {
						--tw-divide-opacity: 1;
						border-color: rgba(var(--primary), var(--tw-divide-opacity));
					}

					.divide-accent > :not([hidden]) ~ :not([hidden]) {
						--tw-divide-opacity: 1;
						border-color: rgba(var(--accent), var(--tw-divide-opacity));
					}
				`,
			]);
		});

		it("inline border opacity", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					safelist: [
						"border-primary/90",
						"border-accent/60",
					],
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

					plugins: [
						thisPlugin({
							fallback: true,
							themes: {
								spring987: {
									mediaQuery: prefersLight,
									semantics: {
										colors: {
											primary: "yellow-200",
											accent: "purple-600",
										},
									},
								},
								fall879: {
									mediaQuery: prefersDark,
									semantics: {
										colors: {
											primary: "purple-600",
											accent: "yellow-200",
										},
									},
								},
							},
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
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
					.border-primary\\/90 {
						border-color: rgba(var(--primary), 0.9);
					}

					.border-accent\\/60 {
						border-color: rgba(var(--accent), 0.6);
					}
				`,
			]);
		});

		it("flattens nested configurations", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					safelist: [
						"orange-theme",
						"bg-primary-faint-400",
						"bg-primary-faint",
						"bg-primary",
						"bg-primary-strong",
						"bg-primary-strong-400",
					],
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

					plugins: [
						thisPlugin({
							baseSelector: "body",
							fallback: true,
							themes: {
								blue: {
									selector: ".blue-theme",
									semantics: {
										colors: {
											primary: {
												faint: {
													400: "blue-100",
													DEFAULT: "blue-400",
												},
												DEFAULT: "blue-500",
												strong: {
													DEFAULT: "blue-600",
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
													DEFAULT: "orange-400",
												},
												DEFAULT: "orange-500",
												strong: {
													DEFAULT: "orange-600",
													400: "orange-900",
												},
											},
										},
									},
								},
							},
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
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
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary-faint-400), var(--tw-bg-opacity));
					}

					.bg-primary-faint {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary-faint), var(--tw-bg-opacity));
					}

					.bg-primary {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary), var(--tw-bg-opacity));
					}

					.bg-primary-strong {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary-strong), var(--tw-bg-opacity));
					}

					.bg-primary-strong-400 {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--primary-strong-400), var(--tw-bg-opacity));
					}
				`,
			]);
		});

		it("gradient color stops", async () => {
			const generated = await generatePluginCSS(
				{
					safelist: [
						"from-primary",
						"from-accent",
						"via-primary",
						"via-accent",
						"to-primary",
						"to-accent",
					],

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

					plugins: [
						thisPlugin({
							fallback: true,
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
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
								},
							},
						}),
					],
				},
				"@tailwind base;\n@tailwind utilities;",
			);

			assertContainsCSS(generated, [
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
					--tw-gradient-from: rgb(var(--primary));
					--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(var(--primary), 0));
				}
				.from-accent {
					--tw-gradient-from: rgb(var(--accent));
					--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(var(--accent), 0));
				}
				`,

				`
				.via-primary {
					--tw-gradient-stops: var(--tw-gradient-from), rgb(var(--primary)), var(--tw-gradient-to, rgba(var(--primary), 0));
				}
				.via-accent {
					--tw-gradient-stops: var(--tw-gradient-from), rgb(var(--accent)), var(--tw-gradient-to, rgba(var(--accent), 0));
				}
				`,

				`
				.to-primary {
					--tw-gradient-to: rgb(var(--primary));
				}
				.to-accent {
					--tw-gradient-to: rgb(var(--accent));
				}
				`,
			]);
		});

		it("supports non-color utilities (font family)", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					safelist: [
						"simple",
						"font-heading",
						"font-body",
						"font-slab",
					],
					theme: {
						fontFamily: {
							slab: ["\"Roboto Slab\"", "\"Times New Roman\""],
							serif: ["\"Times New Roman\"", "\"Roboto Slab\""],
							sans: ["Inter", "Poppins"],
							display: ["Poppins", "Inter"],
						},
					},

					plugins: [
						thisPlugin({
							fallback: true,
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

		it("supports nested themes", async () => {
			assertContainsCSS(await generatePluginCSS(
				{
					safelist: [
						"orange-theme",
						"fuchsia-theme",
						"bg-accent",
					],
					theme: {
						colors: {
							orange: {
								200: "#F80",
								800: "#210",
							},
							fuchsia: {
								200: "#F0F",
								800: "#202",
							},
						},
					},

					plugins: [
						thisPlugin({
							fallback: true,
							themes: {
								light728125: {
									mediaQuery: prefersDark,
									semantics: {
										colors: {
											accent: "light-accent",
										},
									},
								},
								dark728125: {
									mediaQuery: prefersDark,
									semantics: {
										colors: {
											accent: "dark-accent",
										},
									},
								},
							},
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
								},
							},
						}),

						thisPlugin({
							fallback: true,
							themes: {
								orange728125: {
									selector: ".orange-theme",
									semantics: {
										colors: {
											"light-accent": "orange-200",
											"dark-accent": "orange-800",
										},
									},
								},
								fuchsia728125: {
									selector: ".fuchsia-theme",
									semantics: {
										colors: {
											"light-accent": "fuchsia-200",
											"dark-accent": "fuchsia-800",
										},
									},
								},
							},
							utilities: {
								colors: {
									themeValueToVariableValue: colorToRgb,
									variableValueToThemeValue: rgbToThemeValue,
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
						--accent: var(--light-accent);
					}
					@media (prefers-color-scheme: dark) {
						:root {
							--accent: var(--dark-accent);
						}
					}

					:root {
						--light-accent: 255, 136, 0;
						--dark-accent: 34, 17, 0;
					}
					:root.fuchsia-theme {
						--light-accent: 255, 0, 255;
						--dark-accent: 34, 0, 34;
					}
				`,

				`
					.bg-accent {
						--tw-bg-opacity: 1;
						background-color: rgba(var(--accent), var(--tw-bg-opacity));
					}
				`,
			]);
		});
	});
};
