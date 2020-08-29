import { describe, it } from "mocha";

import thisPlugin, {
	canHover, colorsInverted, colorsNotInverted, hover, noHover, print, screen,
} from "../src/index";
import { assertCSS, generatePluginCss } from "./_utils";

export const atApply = (): void => {
	describe("@apply", () => {
		it("lets you experimentally @apply with selectors", async () => {
			assertCSS(await generatePluginCss(
				{
					theme: {},
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
			assertCSS(await generatePluginCss(
				{
					theme: {},
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
			assertCSS(await generatePluginCss(
				{
					theme: {},
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
			assertCSS(await generatePluginCss(
				{
					theme: {},
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
			assertCSS(await generatePluginCss(
				{
					theme: {},
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
			assertCSS(await generatePluginCss(
				{
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
			),
			`
			
				@media (hover: none) {
					button {
						box-shadow: 0 0 2px black;
					}
				}

				html.touch-screen button {
					box-shadow: 0 0 2px black
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
		});

		it("lets you experimentally @apply with media queries and responsive variants", async () => {
			assertCSS(await generatePluginCss(
				{
					theme: {},
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
	});
};
