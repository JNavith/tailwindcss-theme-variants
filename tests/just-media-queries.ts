import { describe, it } from "mocha";

import thisPlugin, {
	prefersAnyContrast, prefersAnyMotion, prefersAnyTransparency, prefersDark, prefersHighContrast, prefersLight, prefersLowContrast, prefersReducedMotion, prefersReducedTransparency,
} from "../src/index";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const justMediaQueries = (): void => {
	describe("just media queries", () => {
		it("works the way the basic usage example with media queries says it will", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					backgroundColor: {
						"teal-500": "#38B2AC",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["light", "dark"],
				},

				plugins: [
					thisPlugin({
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
				.bg-teal-500 {
					background-color: #38B2AC;
				}

				@media (prefers-color-scheme: light) {
					.light\\:bg-teal-500 {
						background-color: #38B2AC;
					}
				}

				@media (prefers-color-scheme: dark) {
					.dark\\:bg-teal-500 {
						background-color: #38B2AC;
					}
				}
			`);
		});

		it("works the way the basic usage example with media queries with fallback says it will", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					backgroundColor: {
						"teal-500": "#38B2AC",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["lightnocache", "darknocache"],
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
					background-color: #38B2AC;
				}

				.lightnocache\\:bg-teal-500 {
					background-color: #38B2AC;
				}

				@media (prefers-color-scheme: light) {
					.lightnocache\\:bg-teal-500 {
						background-color: #38B2AC;
					}
				}

				@media (prefers-color-scheme: dark) {
					.darknocache\\:bg-teal-500 {
						background-color: #38B2AC;
					}
				}
			`);
		});

		it("compacts with fallback", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					backgroundColor: {
						"teal-500": "#38B2AC",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["light789", "dark789"],
				},

				plugins: [
					thisPlugin({
						themes: {
							light789: {
								mediaQuery: prefersLight,
							},
							dark789: {
								mediaQuery: prefersDark,
							},
						},
						fallback: "compact",
					}),
				],
			}),
			`
				.bg-teal-500 {
					background-color: #38B2AC;
				}

				.light789\\:bg-teal-500 {
					background-color: #38B2AC;
				}

				@media (prefers-color-scheme: dark) {
					.dark789\\:bg-teal-500 {
						background-color: #38B2AC;
					}
				}
			`);
		});

		it("supports media queries without selectors with fallback", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					textColor: {
						gold: "#FD0",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["normal-transparency", "reduced-transparency"],
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
					color: #FD0;
				}

				:root .normal-transparency\\:text-gold {
					color: #FD0;
				}

				@media (prefers-reduced-transparency: no-preference) {
					:root .normal-transparency\\:text-gold {
						color: #FD0;
					}
				}

				@media (prefers-reduced-transparency: reduce) {
					:root .reduced-transparency\\:text-gold {
						color: #FD0;
					}
				}
			`);
		});

		it("supports media queries without selectors with fallback without baseSelector", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					textColor: {
						silver: "#EEF",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["normal-contrast", "low-contrast", "high-contrast"],
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
					color: #EEF;
				}

				.normal-contrast\\:text-silver {
					color: #EEF;
				}

				@media (prefers-contrast: no-preference) {
					.normal-contrast\\:text-silver {
						color: #EEF;
					}
				}

				@media (prefers-contrast: low) {
					.low-contrast\\:text-silver {
						color: #EEF;
					}
				}

				@media (prefers-contrast: high) {
					.high-contrast\\:text-silver {
						color: #EEF;
					}
				}
			`);
		});

		it("supports media queries without selectors or baseSelector and with stacking variants", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					backgroundColor: {
						obsidian: "#314",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["normal-motion", "reduced-motion", "normal-motion:first", "reduced-motion:first", "normal-motion:last", "reduced-motion:last"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "",
						themes: {
							"normal-motion": { mediaQuery: prefersAnyMotion },
							"reduced-motion": { mediaQuery: prefersReducedMotion },
						},
					}),
				],
			}),
			`
				.bg-obsidian {
					background-color: #314;
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion\\:bg-obsidian {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:bg-obsidian {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion\\:first\\:bg-obsidian:first-child {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:first\\:bg-obsidian:first-child {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion\\:last\\:bg-obsidian:last-child {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:last\\:bg-obsidian:last-child {
						background-color: #314;
					}
				}
			`);
		});

		it("supports media queries without selectors and implicit empty baseSelector and with stacking variants and grouping", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					backgroundColor: {
						obsidian: "#314",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["motion", "motion:first", "motion:last"],
				},
				plugins: [
					thisPlugin({
						group: "motion",
						themes: {
							"normal-motion": { mediaQuery: prefersAnyMotion },
							"reduced-motion": { mediaQuery: prefersReducedMotion },
						},
					}),
				],
			}),
			`
				.bg-obsidian {
					background-color: #314;
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion\\:bg-obsidian {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:bg-obsidian {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion\\:first\\:bg-obsidian:first-child {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:first\\:bg-obsidian:first-child {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: no-preference) {
					.normal-motion\\:last\\:bg-obsidian:last-child {
						background-color: #314;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:last\\:bg-obsidian:last-child {
						background-color: #314;
					}
				}
			`);
		});

		it("supports being called more than once with different options", async () => {
			assertExactCSS(await generatePluginCSS({
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
				corePlugins: ["backgroundColor", "transitionDuration"],
				variants: {
					backgroundColor: ["reduced-motion", "light-theme", "dark-theme"],
					transitionDuration: ["reduced-motion"],
				},
				plugins: [
					thisPlugin({
						fallback: true,
						themes: {
							"light-theme": { mediaQuery: prefersLight },
							"dark-theme": { mediaQuery: prefersDark },
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
					background-color: #B37;
				}

				.bg-bush {
					background-color: #073;
				}

				@media (prefers-reduced-motion: reduce) {
					.reduced-motion\\:bg-berry {
						background-color: #B37;
					}

					.reduced-motion\\:bg-bush {
						background-color: #073;
					}
				}

				.light-theme\\:bg-berry {
					background-color: #B37;
				}

				.light-theme\\:bg-bush {
					background-color: #073;
				}

				@media (prefers-color-scheme: light) {
					.light-theme\\:bg-berry {
						background-color: #B37
					}

					.light-theme\\:bg-bush {
						background-color: #073
					}
				}

				@media (prefers-color-scheme: dark) {
					.dark-theme\\:bg-berry {
						background-color: #B37
					}

					.dark-theme\\:bg-bush {
						background-color: #073
					}
				}

				.duration-0 {
					transition-duration: 0ms;
				}

				.duration-500 {
					transition-duration: 500ms;
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

		it("supports the new provided selection variant with fallback without a baseSelector (because it was implicitly disabled)", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					textColor: {
						"gray-200": "#EDF2F7",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["light:selection", "dark:selection"],
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
					color: #EDF2F7;
				}

				.light\\:selection\\:text-gray-200::selection, .light\\:selection\\:text-gray-200 ::selection {
					color: #EDF2F7;
				}
			
				@media (prefers-color-scheme: light) {
					.light\\:selection\\:text-gray-200::selection, .light\\:selection\\:text-gray-200 ::selection {
						color: #EDF2F7;
					}
				}
				
				@media (prefers-color-scheme: dark) {
					.dark\\:selection\\:text-gray-200::selection, .dark\\:selection\\:text-gray-200 ::selection {
						color: #EDF2F7;
					}
				}
			`);
		});
	});
};
