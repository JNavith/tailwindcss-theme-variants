import { describe, it } from "mocha";
import { createSandbox } from "sinon";

import thisPlugin, {
	canHover, colorsInverted, colorsNotInverted, hover, noHover, print, screen,
} from "../src/index";
import { assertExactCSS, generatePluginCSS, onTailwind2 } from "./_utils";

export const atApply = (): void => {
	describe("@apply", () => {
		it("lets you experimentally @apply with selectors", async () => {
			assertExactCSS(await generatePluginCSS(
				{
					theme: {
						colors: {
							white: "#fff",
							gray: {
								100: "#f7fafc",
								800: "#2d3748",
								900: "#1a202c",
							},
						},
					},
					corePlugins: ["backgroundColor", "textColor"],
					variants: {
						backgroundColor: ["light", "dark"],
						textColor: ["light", "dark"],
					},

					plugins: [
						thisPlugin({
							themes: {
								light: {
									selector: ".light-theme",
								},
								dark: {
									selector: ".dark-theme",
								},
							},
						}),
					],

					experimental: {
						applyComplexClasses: true,
					},
				},
				`
					.themed-button { 
						@apply light:text-gray-900 light:bg-gray-100;
						@apply dark:text-white dark:bg-gray-800;
					}
				`,
			),
			`
				:root.light-theme .themed-button {
					background-color: #f7fafc;
					color: #1a202c;
				}

				:root.dark-theme .themed-button {
					background-color: #2d3748;
					color: #fff;
				}
			`);
		});

		it("lets you experimentally @apply with selectors with fallback with grouping and stacking variants", async () => {
			assertExactCSS(await generatePluginCSS(
				{
					theme: {
						colors: {
							green: {
								100: "#f0fff4",
								300: "#9ae6b4",
								400: "#68d391",
								600: "#38a169",
							},
						},
					},
					corePlugins: ["backgroundColor"],
					variants: {
						backgroundColor: ["food", "food:hover"],
					},

					plugins: [
						thisPlugin({
							group: "food",
							baseSelector: ".food-basket",
							themes: {
								olive: {
									selector: "[data-type=olive]",
								},
								lime: {
									selector: "[data-type=lime]",
								},
							},
							fallback: true,
							variants: {
								hover,
							},
						}),
					],

					experimental: {
						applyComplexClasses: true,
					},
				},
				`
					.food { 
						@apply olive:bg-green-600 lime:bg-green-300;
						@apply olive:hover:bg-green-400 lime:hover:bg-green-100;
					}
				`,
			),
			`
				.food-basket:not([data-type=lime]) .food {
					background-color: #38a169;
				}
				.food-basket[data-type=olive] .food {
					background-color: #38a169;
				}

				.food-basket[data-type=lime] .food {
					background-color: #9ae6b4
				}


				.food-basket:not([data-type=lime]) .food:hover {
					background-color: #68d391;
				}
				.food-basket[data-type=olive] .food:hover {
					background-color: #68d391;
				}

				.food-basket[data-type=lime] .food:hover {
					background-color: #f0fff4;
				}

			`);
		});

		it("lets you experimentally @apply with media queries", async () => {
			assertExactCSS(await generatePluginCSS(
				{
					theme: {
						colors: {
							white: "#fff",
							yellow: {
								300: "#faf089",
							},
						},
					},
					corePlugins: ["backgroundColor"],
					variants: {
						backgroundColor: ["screen", "print"],
					},

					plugins: [
						thisPlugin({
							themes: {
								screen: {
									mediaQuery: screen,
								},
								print: {
									mediaQuery: print,
								},
							},
						}),
					],

					experimental: {
						applyComplexClasses: true,
					},
				},
				`
					mark {
						@apply screen:bg-yellow-300;
						@apply print:bg-white;
					}
				`,
			),
			`
				@media screen {
					mark {
						background-color: #faf089;
					}
				}

				@media print {
					mark {
						background-color: #fff;
					}
				}
			`);
		});

		it("lets you experimentally @apply with media queries and responsive variants", async () => {
			assertExactCSS(await generatePluginCSS(
				{
					theme: {
						colors: {
							gray: {
								100: "#f7fafc",
								300: "#e2e8f0",
								600: "#718096",
								800: "#2d3748",
							},
						},
					},
					corePlugins: ["textColor"],
					variants: {
						textColor: ["responsive", "normal", "inverted"],
					},

					plugins: [
						thisPlugin({
							themes: {
								normal: {
									mediaQuery: colorsNotInverted,
								},
								inverted: {
									mediaQuery: colorsInverted,
								},
							},
						}),
					],

					experimental: {
						applyComplexClasses: true,
					},
				},
				`
					.caption span {
						@apply normal:text-gray-100 inverted:text-gray-800;
						@apply md:normal:text-gray-300 md:inverted:text-gray-600;
					}
				`,
			),
			`
				@media (inverted-colors: none) {
					.caption span {
						color: #f7fafc;
					}
				}

				@media (inverted-colors: inverted) {
					.caption span {
						color: #2d3748;
					}
				}

				@media (min-width: 768px) {
					@media (inverted-colors: none) {
						.caption span {
							color: #e2e8f0;
						}
					}

					@media (inverted-colors: inverted) {
						.caption span {
							color: #718096;
						}
					}
				}
			`);
		});

		it("lets you experimentally @apply with media queries with fallback", async () => {
			assertExactCSS(await generatePluginCSS(
				{
					theme: {
						colors: {
							white: "#fff",
							green: {
								300: "#9ae6b4",
							},
						},
					},
					corePlugins: ["backgroundColor"],
					variants: {
						backgroundColor: ["screen2", "print2"],
					},

					plugins: [
						thisPlugin({
							themes: {
								screen2: {
									mediaQuery: screen,
								},
								print2: {
									mediaQuery: print,
								},
							},
							fallback: true,
						}),
					],

					experimental: {
						applyComplexClasses: true,
					},
				},
				`
					mark {
						@apply screen2:bg-green-300;
						@apply print2:bg-white;
					}
				`,
			),
			`
				mark {
					background-color: #9ae6b4;
				}

				@media screen {
					mark {
						background-color: #9ae6b4;
					}
				}

				@media print {
					mark {
						background-color: #fff;
					}
				}
			`);
		});

		it("lets you experimentally @apply with media queries and selectors with grouping", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

			const generated = await generatePluginCSS(
				{
					target: "relaxed",

					theme: {
						boxShadow: {
							sm: "0 0 2px black",
							lg: "0 0 8px black",
						},
					},
					corePlugins: ["boxShadow"],
					variants: {
						boxShadow: ["hoverability"],
					},

					plugins: [
						thisPlugin({
							group: "hoverability",
							baseSelector: "html",
							themes: {
								"no-hover": {
									selector: ".touch-screen",
									mediaQuery: noHover,
								},
								"can-hover": {
									selector: ".touchless-screen",
									mediaQuery: canHover,
								},
							},
						}),
					],

					experimental: {
						applyComplexClasses: true,
					},
				},
				`
					button {
						@apply no-hover:shadow-sm;
						@apply can-hover:shadow-lg;
					}
				`,
			);

			if (onTailwind2(consoleStub.getCalls())) {
				assertExactCSS(
					generated,
				`
					@media (hover: none) {
						button {
							--box-shadow: 0 0 2px black;
							box-shadow: var(--ring-offset-shadow, 0 0 #0000), var(--ring-shadow, 0 0 #0000), var(--box-shadow);
						}
					}

					html.touch-screen button {
						--box-shadow: 0 0 2px black;
						box-shadow: var(--ring-offset-shadow, 0 0 #0000), var(--ring-shadow, 0 0 #0000), var(--box-shadow);
					}

					@media (hover: hover) {
						button {
							--box-shadow: 0 0 8px black;
							box-shadow: var(--ring-offset-shadow, 0 0 #0000), var(--ring-shadow, 0 0 #0000), var(--box-shadow);
						}
					}

					html.touchless-screen button {
						--box-shadow: 0 0 8px black;
						box-shadow: var(--ring-offset-shadow, 0 0 #0000), var(--ring-shadow, 0 0 #0000), var(--box-shadow);
					}
				`);
			} else {
				assertExactCSS(
					generated,
				`
					@media (hover: none) {
						button {
							box-shadow: 0 0 2px black;
						}
					}

					html.touch-screen button {
						box-shadow: 0 0 2px black;
					}

					@media (hover: hover) {
						button {
							box-shadow: 0 0 8px black;
						}
					}

					html.touchless-screen button {
						box-shadow: 0 0 8px black;
					}
				`);
			}

			sandbox.restore();
		});
	});
};
