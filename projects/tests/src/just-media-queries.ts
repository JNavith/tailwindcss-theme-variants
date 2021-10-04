import { describe, it } from "mocha";

import {
	themeVariants as thisPlugin,
	prefersAnyContrast, prefersAnyMotion, prefersAnyTransparency, prefersDark, prefersHighContrast, prefersLight, prefersLowContrast, prefersReducedMotion, prefersReducedTransparency,
} from "tailwindcss-theme-variants";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const justMediaQueries = (): void => {
	describe("just media queries", () => {
		it("works the way the basic usage example with media queries says it will", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"bg-teal-500",
					"light9812374:bg-teal-500",
					"dark9812374:bg-teal-500",
				],
				theme: {
					backgroundColor: {
						"teal-500": "#38B2AC",
					},
				},
				plugins: [
					thisPlugin({
						themes: {
							light9812374: {
								mediaQuery: prefersLight,
							},
							dark9812374: {
								mediaQuery: prefersDark,
							},
						},
					}),
				],
			}),
			`
				.bg-teal-500 {
					--tw-bg-opacity: 1;
					background-color: rgb(56 178 172 / var(--tw-bg-opacity));
				}

				@media (prefers-color-scheme: light) {
					.light9812374\\:bg-teal-500 {
						--tw-bg-opacity: 1;
						background-color: rgb(56 178 172 / var(--tw-bg-opacity));
					}
				}

				@media (prefers-color-scheme: dark) {
					.dark9812374\\:bg-teal-500 {
						--tw-bg-opacity: 1;
						background-color: rgb(56 178 172 / var(--tw-bg-opacity));
					}
				}
			`);
		});

		it("works the way the basic usage example with media queries with fallback says it will (compact)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"bg-teal-500",
					"lightnocache:bg-teal-500",
					"darknocache:bg-teal-500",
				],
				theme: {
					backgroundColor: {
						"teal-500": "#38B2AC",
					},
				},

				plugins: [
					thisPlugin({
						themes: {
							lightnocache: {
								mediaQuery: prefersLight,
							},
							darknocache: {
								mediaQuery: prefersDark,
							},
						},
						fallback: true,
					}),
				],
			}),
			`
				.bg-teal-500 {
					--tw-bg-opacity: 1;
					background-color: rgb(56 178 172 / var(--tw-bg-opacity));
				}

				.lightnocache\\:bg-teal-500 {
					--tw-bg-opacity: 1;
					background-color: rgb(56 178 172 / var(--tw-bg-opacity));
				}

				@media (prefers-color-scheme: dark) {
					.darknocache\\:bg-teal-500 {
					--tw-bg-opacity: 1;
					background-color: rgb(56 178 172 / var(--tw-bg-opacity));
					}
				}
			`);
		});

		it("supports media queries without selectors with fallback", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"text-gold",
					"normal-transparency:text-gold",
					"reduced-transparency:text-gold",
				],
				theme: {
					textColor: {
						gold: "#FD0",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: ":root",
						fallback: true,
						themes: {
							"normal-transparency": { mediaQuery: prefersAnyTransparency },
							"reduced-transparency": { mediaQuery: prefersReducedTransparency },
						},
					}),
				],
			}),
			`
				.text-gold {
					--tw-text-opacity: 1;
					color: rgb(255 221 0 / var(--tw-text-opacity));
				}

				:root .normal-transparency\\:text-gold {
					--tw-text-opacity: 1;
					color: rgb(255 221 0 / var(--tw-text-opacity));
				}
				
				@media (prefers-reduced-transparency: reduce) {
					:root .reduced-transparency\\:text-gold {
					--tw-text-opacity: 1;
						color: rgb(255 221 0 / var(--tw-text-opacity));
					}
				}
			`);
		});

		it("supports media queries without selectors with fallback without baseSelector", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"text-silver",
					"normal-contrast:text-silver",
					"low-contrast:text-silver",
					"high-contrast:text-silver",
				],
				theme: {
					textColor: {
						silver: "#EEF",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: "",
						fallback: true,
						themes: {
							"normal-contrast": { mediaQuery: prefersAnyContrast },
							"low-contrast": { mediaQuery: prefersLowContrast },
							"high-contrast": { mediaQuery: prefersHighContrast },
						},
					}),
				],
			}),
			`
				.text-silver {
					--tw-text-opacity: 1;
					color: rgb(238 238 255 / var(--tw-text-opacity));
				}

				.normal-contrast\\:text-silver {
					--tw-text-opacity: 1;
					color: rgb(238 238 255 / var(--tw-text-opacity));
				}

				@media (prefers-contrast: less) {
					.low-contrast\\:text-silver {
						--tw-text-opacity: 1;
						color: rgb(238 238 255 / var(--tw-text-opacity));
					}
				}

				@media (prefers-contrast: more) {
					.high-contrast\\:text-silver {
						--tw-text-opacity: 1;
						color: rgb(238 238 255 / var(--tw-text-opacity));
					}
				}
			`);
		});

		it("supports media queries without selectors or baseSelector and with stacking variants", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"bg-obsidian",
					"normal-motion4537:bg-obsidian",
					"reduced-motion4537:bg-obsidian",
					"normal-motion4537:first:bg-obsidian",
					"reduced-motion4537:first:bg-obsidian",
					"normal-motion4537:last:bg-obsidian",
					"reduced-motion4537:last:bg-obsidian",
				],
				theme: {
					backgroundColor: {
						obsidian: "#314",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: "",
						themes: {
							"normal-motion4537": { mediaQuery: prefersAnyMotion },
							"reduced-motion4537": { mediaQuery: prefersReducedMotion },
						},
					}),
				],
			}),
			`
				.bg-obsidian {
					--tw-bg-opacity: 1;
					background-color: rgb(51 17 68 / var(--tw-bg-opacity));
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion4537\\:bg-obsidian {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
					.normal-motion4537\\:first\\:bg-obsidian:first-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
					.normal-motion4537\\:last\\:bg-obsidian:last-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion4537\\:bg-obsidian {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
					.reduced-motion4537\\:first\\:bg-obsidian:first-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
					.reduced-motion4537\\:last\\:bg-obsidian:last-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
				}
			`);
		});

		it("supports media queries without selectors and implicit empty baseSelector and with stacking variants", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"bg-obsidian",
					"normal-motion8838:bg-obsidian",
					"reduced-motion8838:bg-obsidian",
					"normal-motion8838:first:bg-obsidian",
					"reduced-motion8838:first:bg-obsidian",
					"normal-motion8838:last:bg-obsidian",
					"reduced-motion8838:last:bg-obsidian",
				],
				theme: {
					backgroundColor: {
						obsidian: "#314",
					},
				},
				plugins: [
					thisPlugin({
						themes: {
							"normal-motion8838": { mediaQuery: prefersAnyMotion },
							"reduced-motion8838": { mediaQuery: prefersReducedMotion },
						},
					}),
				],
			}),
			`
				.bg-obsidian {
					--tw-bg-opacity: 1;
					background-color: rgb(51 17 68 / var(--tw-bg-opacity));
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion8838\\:bg-obsidian {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}

					.normal-motion8838\\:first\\:bg-obsidian:first-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}

					.normal-motion8838\\:last\\:bg-obsidian:last-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion8838\\:bg-obsidian {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}

					.reduced-motion8838\\:first\\:bg-obsidian:first-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}

					.reduced-motion8838\\:last\\:bg-obsidian:last-child {
						--tw-bg-opacity: 1;
						background-color: rgb(51 17 68 / var(--tw-bg-opacity));
					}
				}
			`);
		});

		// TODO: fix
		const workingTest = false;
		if (workingTest) {
			it("supports being called more than once with different options", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"bg-berry",
						"bg-bush",
						"reduced-motion:bg-berry",
						"reduced-motion:bg-bush",
						"light-theme334:bg-berry",
						"light-theme334:bg-bush",
						"dark-theme334:bg-berry",
						"dark-theme334:bg-bush",
						"duration-0",
						"duration-500",
						"reduced-motion:duration-0",
						"reduced-motion:duration-500",
					],
					theme: {
						backgroundColor: {
							berry: "#B37",
							bush: "#073",
						},
						transitionDuration: {
							0: "0ms",
							500: "500ms",
						},
					},
					plugins: [
						thisPlugin({
							fallback: true,
							themes: {
								"light-theme334": { mediaQuery: prefersLight },
								"dark-theme334": { mediaQuery: prefersDark },
							},
						}),
						thisPlugin({
							baseSelector: "",
							themes: {
								"reduced-motion": { mediaQuery: prefersReducedMotion },
							},
						}),
					],
				}),
				`
				.bg-berry {
					--tw-bg-opacity: 1;
					background-color: rgb(187 51 119 / var(--tw-bg-opacity));
				}

				.bg-bush {
					--tw-bg-opacity: 1;
					background-color: rgb(0 119 51 / var(--tw-bg-opacity));
				}

				.duration-0 {
					transition-duration: 0ms;
				}

				.duration-500 {
					transition-duration: 500ms;
				}

				.light-theme334\\:bg-berry {
					--tw-bg-opacity: 1;
					background-color: rgb(187 51 119 / var(--tw-bg-opacity));
				}

				.light-theme334\\:bg-bush {
					--tw-bg-opacity: 1;
					background-color: rgb(0 119 51 / var(--tw-bg-opacity));
				}

				@media (prefers-color-scheme: dark) {
					.dark-theme334\\:bg-berry {
						--tw-bg-opacity: 1;
      					background-color: rgb(187 51 119 / var(--tw-bg-opacity));
					}

					.dark-theme334\\:bg-bush {
						--tw-bg-opacity: 1;
						background-color: rgb(0 119 51 / var(--tw-bg-opacity));
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:bg-berry {
						--tw-bg-opacity: 1;
						background-color: rgb(187 51 119 / var(--tw-bg-opacity));
					}

					.reduced-motion\\:bg-bush {
						--tw-bg-opacity: 1;
						background-color: rgb(0 119 51 / var(--tw-bg-opacity));
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:duration-0 {
						transition-duration: 0ms;
					}

					.reduced-motion\\:duration-500 {
						transition-duration: 500ms;
					}
				}
			`);
			});
		}

		it("supports the selection variant with fallback without a baseSelector (because it was implicitly disabled)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"text-gray-200",
					"light:selection:text-gray-200",
					"dark:selection:text-gray-200",
				],

				theme: {
					textColor: {
						"gray-200": "#EDF2F7",
					},
				},

				plugins: [
					thisPlugin({
						fallback: true,
						themes: {
							light: {
								mediaQuery: prefersLight,
							},
							dark: {
								mediaQuery: prefersDark,
							},
						},
					}),
				],
			}),
			`
				.text-gray-200 {
					--tw-text-opacity: 1;
      				color: rgb(237 242 247 / var(--tw-text-opacity));
				}

				.light\\:selection\\:text-gray-200 *::selection {
					--tw-text-opacity: 1;
      				color: rgb(237 242 247 / var(--tw-text-opacity));
				}

				.light\\:selection\\:text-gray-200::selection {
					--tw-text-opacity: 1;
      				color: rgb(237 242 247 / var(--tw-text-opacity));
				}
				
				@media (prefers-color-scheme: dark) {
					.dark\\:selection\\:text-gray-200 *::selection {
						--tw-text-opacity: 1;
						color: rgb(237 242 247 / var(--tw-text-opacity));
					}
					.dark\\:selection\\:text-gray-200::selection {
						--tw-text-opacity: 1;
						color: rgb(237 242 247 / var(--tw-text-opacity));
					}
				}
			`);
		});
	});
};
