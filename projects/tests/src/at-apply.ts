import { describe, it } from "mocha";
import { createSandbox } from "sinon";

import {
	themeVariants as thisPlugin,
	canHover, colorsInverted, colorsNotInverted, noHover, print, screen,
} from "tailwindcss-theme-variants";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const atApply = (): void => {
	describe("@apply", () => {
		it("lets you @apply with selectors", async () => {
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

					plugins: [
						thisPlugin({
							themes: {
								light32: {
									selector: ".light-theme",
								},
								dark32: {
									selector: ".dark-theme",
								},
							},
						}),
					],
				},
				`
					.themed-button { 
						@apply light32:text-gray-900 light32:bg-gray-100;
						@apply dark32:text-white dark32:bg-gray-800;
					}
				`,
			),
			`
				:root.light-theme .themed-button {
					--tw-bg-opacity: 1;
					background-color: rgb(247 250 252 / var(--tw-bg-opacity));
					--tw-text-opacity: 1;
					color: rgb(26 32 44 / var(--tw-text-opacity));
				}

				:root.dark-theme .themed-button {
					--tw-bg-opacity: 1;
					background-color: rgb(45 55 72 / var(--tw-bg-opacity));
					--tw-text-opacity: 1;
      				color: rgb(255 255 255 / var(--tw-text-opacity));
				}
			`);
		});

		it("lets you @apply with selectors with fallback and stacking variants", async () => {
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

					plugins: [
						thisPlugin({
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
						}),
					],
				},
				`
					.food { 
						@apply olive:bg-green-600 lime:bg-green-300;
						@apply olive:hover:bg-green-400 lime:hover:bg-green-100;
					}
				`,
			),
			`
				.food-basket .food {
					--tw-bg-opacity: 1;
					background-color: rgb(56 161 105 / var(--tw-bg-opacity));
				}
				
				.food-basket[data-type=lime] .food {
					--tw-bg-opacity: 1;
					background-color: rgb(154 230 180 / var(--tw-bg-opacity));
				}
				
				.food-basket .food:hover {
					--tw-bg-opacity: 1;
					background-color: rgb(104 211 145 / var(--tw-bg-opacity));
				}
				
				.food-basket[data-type=lime] .food:hover {
					--tw-bg-opacity: 1;
					background-color: rgb(240 255 244 / var(--tw-bg-opacity));
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
						--tw-bg-opacity: 1;
						background-color: rgb(250 240 137 / var(--tw-bg-opacity));
					}
				}

				@media print {
					mark {
						--tw-bg-opacity: 1;
						background-color: rgb(255 255 255 / var(--tw-bg-opacity));
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
				},
				`
					.caption span {
						@apply normal:text-gray-100;
						@apply inverted:text-gray-800;
						@apply md:normal:text-gray-300;
						@apply md:inverted:text-gray-600;
					}
				`,
			),
			`
				@media (inverted-colors: none) {
					.caption span {
						--tw-text-opacity: 1;
						color: rgb(247 250 252 / var(--tw-text-opacity));
					}
				}

				@media (inverted-colors: inverted) {
					.caption span {
						--tw-text-opacity: 1;
						color: rgb(45 55 72 / var(--tw-text-opacity));
					}
				}

				@media (min-width: 768px) {
					@media (inverted-colors: none) {
						.caption span {
							--tw-text-opacity: 1;
							color: rgb(226 232 240 / var(--tw-text-opacity));
						}
					}

					@media (inverted-colors: inverted) {
						.caption span {
							--tw-text-opacity: 1;
							color: rgb(113 128 150 / var(--tw-text-opacity));
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
					--tw-bg-opacity: 1;
					background-color: rgb(154 230 180 / var(--tw-bg-opacity));
				}
				
				@media print {
					mark {
						--tw-bg-opacity: 1;
						background-color: rgb(255 255 255 / var(--tw-bg-opacity));
					}
				}
			`);
		});

		// TODO: report issue
		const workingTest = false;
		if (workingTest) {
			it("lets you experimentally @apply with media queries and selectors", async () => {
				const sandbox = createSandbox();

				const generated = await generatePluginCSS(
					{
						safelist: [
							"touchless-screen",
							"touch-screen",
						],
						theme: {
							boxShadow: {
								sm: "0 0 2px black",
								lg: "0 0 8px black",
							},
						},

						plugins: [
							thisPlugin({
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
					},
					`
					button {
						@apply no-hover:shadow-sm;
						@apply can-hover:shadow-lg;
					}
				`,
				);

				assertExactCSS(
					generated,
					`
					@media (hover: none) {
						button {
							--tw-shadow: 0 0 2px black;
							box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
						}
					}

					html.touch-screen button {
						--tw-shadow: 0 0 2px black;
						box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
					}

					@media (hover: hover) {
						button {
							--tw-shadow: 0 0 8px black;
							box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
						}
					}

					html.touchless-screen button {
						--tw-shadow: 0 0 8px black;
						box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
					}
				`,
				);

				sandbox.restore();
			});
		}
	});
};
