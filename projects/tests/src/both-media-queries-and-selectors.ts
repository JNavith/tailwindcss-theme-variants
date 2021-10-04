import { describe, it } from "mocha";

import {
	themeVariants as thisPlugin,
	prefersDark, prefersLight,
} from "tailwindcss-theme-variants";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const bothSelectorsAndMediaQueries = (): void => {
	describe("both selectors and media queries", () => {
		// TODO: report issue
		const workingTest4 = false;
		if (workingTest4) {
			it("supports media queries without fallback", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"html",
						"light",
						"bg-blue",
						"light8934527:bg-blue",
					],
					theme: {
						backgroundColor: {
							blue: "#0000FF",
						},
					},
					plugins: [
						thisPlugin({
							baseSelector: "html",
							themes: {
								light8934527: { selector: ".light", mediaQuery: prefersLight },
							},
						}),
					],
				}),
				`
					.bg-blue {
						--tw-bg-opacity: 1;
						background-color: rgb(0 0 255 / var(--tw-bg-opacity));
					}

					@media (prefers-color-scheme: light) {
						.light8934527\\:bg-blue {
							--tw-bg-opacity: 1;
							background-color: rgb(0 0 255 / var(--tw-bg-opacity));
						}
					}

					html.light .light8934527\\:bg-blue {
						--tw-bg-opacity: 1;
						background-color: rgb(0 0 255 / var(--tw-bg-opacity));
					}
				`);
			});
		}

		it("supports media queries with fallback with only one theme (even though that's recommended against)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"theme-dark",
					"bg-pink",
					"dark45213:bg-pink",
				],
				theme: {
					backgroundColor: {
						pink: "#FF00FF",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						fallback: true,
						themes: {
							dark45213: { selector: ".theme-dark", mediaQuery: prefersDark },
						},
					}),
				],
			}),
			`
				.bg-pink {
					--tw-bg-opacity: 1;
					background-color: rgb(255 0 255 / var(--tw-bg-opacity));
				}
				
				html .dark45213\\:bg-pink {
					--tw-bg-opacity: 1;
					background-color: rgb(255 0 255 / var(--tw-bg-opacity));
				}
			`);
		});

		// TODO: finish fixing
		const workingTest3 = false;
		if (workingTest3) {
			it("supports responsive variants with user-defined media queries", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"bg-dark-gray",
						"white:bg-dark-gray",
						"white",
						"tiny:bg-dark-gray",
						"tiny:white:bg-dark-gray",
						"huge:bg-dark-gray",
						"huge:white:bg-dark-gray",
					],
					theme: {
						backgroundColor: {
							"dark-gray": "#123",
						},
						screens: {
							tiny: "100px",
							huge: "900px",
						},
					},
					plugins: [
						thisPlugin({
							themes: {
								white: { selector: ".white", mediaQuery: prefersLight },
							},
						}),
					],
				}),
				`
				.bg-dark-gray {
					--tw-bg-opacity: 1;
					background-color: rgb(17 34 51 / var(--tw-bg-opacity));
				}

				@media (prefers-color-scheme: light) {
					.white\\:bg-dark-gray {
						--tw-bg-opacity: 1;
						background-color: rgb(17 34 51 / var(--tw-bg-opacity));
					}
				}

				:root.white .white\\:bg-dark-gray {
					--tw-bg-opacity: 1;
					background-color: rgb(17 34 51 / var(--tw-bg-opacity));
				}

				@media (min-width: 100px) {
					.tiny\\:bg-dark-gray {
						--tw-bg-opacity: 1;
						background-color: rgb(17 34 51 / var(--tw-bg-opacity));
					}

					@media (prefers-color-scheme: light) {
						.tiny\\:white\\:bg-dark-gray {
							--tw-bg-opacity: 1;
							background-color: rgb(17 34 51 / var(--tw-bg-opacity));
						}
					}

					:root.white .tiny\\:white\\:bg-dark-gray {
						--tw-bg-opacity: 1;
						background-color: rgb(17 34 51 / var(--tw-bg-opacity));
					}
				}

				@media (min-width: 900px) {
					.huge\\:bg-dark-gray {
						--tw-bg-opacity: 1;
						background-color: rgb(17 34 51 / var(--tw-bg-opacity));
					}

					@media (prefers-color-scheme: light) {
						.huge\\:white\\:bg-dark-gray {
							--tw-bg-opacity: 1;
							background-color: rgb(17 34 51 / var(--tw-bg-opacity));
						}
					}

					:root.white .huge\\:white\\:bg-dark-gray {
						--tw-bg-opacity: 1;
						background-color: rgb(17 34 51 / var(--tw-bg-opacity));
					}
				}
			`);
			});
		}

		// TODO: finish fixing
		const workingTest2 = false;
		if (workingTest2) {
			it("supports unstacked responsive variants and user-defined media queries and fallback", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"html",
						"dark-theme",
						"light-theme",
						"text-brown",
						"theme-dark72:text-brown",
						"theme-light72:text-brown",
						"middle:text-brown",
						"middle:theme-dark72:text-brown",
						"middle:theme-light72:text-brown",
					],
					theme: {
						textColor: {
							brown: "#640",
						},
						screens: {
							middle: "600px",
						},
					},
					plugins: [
						thisPlugin({
							baseSelector: "html",
							fallback: true,
							themes: {
								"theme-dark72": { selector: ".dark-theme", mediaQuery: prefersDark },
								"theme-light72": { selector: ".light-theme", mediaQuery: prefersLight },
							},
						}),
					],
				}),
				`
				.text-brown {
					--tw-text-opacity: 1;
					color: rgb(102 68 0 / var(--tw-text-opacity));
				}

				html .theme-dark72\\:text-brown {
					--tw-text-opacity: 1;
					color: rgb(102 68 0 / var(--tw-text-opacity));
				}

				@media (prefers-color-scheme: light) {
					html:not(.dark-theme) .theme-light72\\:text-brown {
						--tw-text-opacity: 1;
						color: rgb(102 68 0 / var(--tw-text-opacity));
					}
				}

				html.light-theme .theme-light72\\:text-brown {
					--tw-text-opacity: 1;
					color: rgb(102 68 0 / var(--tw-text-opacity));
				}

				@media (min-width: 600px) {
					.middle\\:text-brown {
						--tw-text-opacity: 1;
						color: rgb(102 68 0 / var(--tw-text-opacity));
					}

					html .middle\\:theme-dark72\\:text-brown {
						--tw-text-opacity: 1;
						color: rgb(102 68 0 / var(--tw-text-opacity));
					}

					@media (prefers-color-scheme: light) {
						html:not(.dark-theme) .middle\\:theme-light72\\:text-brown {
							--tw-text-opacity: 1;
							color: rgb(102 68 0 / var(--tw-text-opacity));
						}
					}

					html.light-theme .middle\\:theme-light72\\:text-brown {
						--tw-text-opacity: 1;
						color: rgb(102 68 0 / var(--tw-text-opacity));
					}
				}
			`);
			});
		}

		// TODO: finish fixing
		const workingTest = false;
		if (workingTest) {
			it("(OMG) supports stacked responsive variants and partial use of user-defined media queries and fallback and custom separator", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"world",
						"time-night",
						"time-day",
						"moon-out",
						"sun-out",
						"stroke-cream",
						"time-day~disabled~stroke-cream",
						"time-night~disabled~stroke-cream",
						"time-day~odd~stroke-cream",
						"time-night~odd~stroke-cream",
						"small~stroke-cream",
						"small~time-day~disabled~stroke-cream",
						"small~time-night~disabled~stroke-cream",
						"small~time-day~odd~stroke-cream",
						"small~time-night~odd~stroke-cream",
						"large~stroke-cream",
						"large~time-day~disabled~stroke-cream",
						"large~time-night~disabled~stroke-cream",
						"large~time-day~odd~stroke-cream",
						"large~time-night~odd~stroke-cream",
					],
					separator: "~",
					theme: {
						stroke: {
							cream: "#FED",
						},
						screens: {
							small: "400px",
							large: "1300px",
						},
					},
					plugins: [
						thisPlugin({
							baseSelector: ".world",
							themes: {
								"time-night": { selector: ".moon-out" },
								"time-day": { selector: ".sun-out", mediaQuery: prefersLight },
							},
							fallback: true,
						}),
					],
				}),
				`
				.stroke-cream {
					stroke: #FED;
				}

				.world .time-night\\~odd\\~stroke-cream:nth-child(odd) {
					stroke: #FED;
				}
				.world .time-night\\~disabled\\~stroke-cream:disabled {
					stroke: #FED;
				}

				@media (prefers-color-scheme: light) {
					.world:not(.moon-out) .time-day\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
					.world:not(.moon-out) .time-day\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}
				}

				@media (min-width: 400px) {
					.small\\~stroke-cream {
						stroke: #FED;
					}

					.world .small\\~time-night\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
					.world .small\\~time-night\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .small\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
							stroke: #FED;
						}
					}
					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .small\\~time-day\\~disabled\\~stroke-cream:disabled {
							stroke: #FED;
						}
					}
				}

				@media (min-width: 1300px) {
					.large\\~stroke-cream {
						stroke: #FED;
					}

					.world .large\\~time-night\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
					.world .large\\~time-night\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .large\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
							stroke: #FED;
						}
					}
					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .large\\~time-day\\~disabled\\~stroke-cream:disabled {
							stroke: #FED;
						}
					}
				}


				/* TODO: when do these show up!? */
				.world.sun-out .time-day\\~disabled\\~stroke-cream:disabled {
					stroke: #FED;
				}
				}

				.world.sun-out .time-day\\~odd\\~stroke-cream:nth-child(odd) {
					stroke: #FED;
				}

				@media (min-width: 400px) {

					.world.sun-out .small\\~time-day\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					.world.sun-out .small\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
				}

				@media (min-width: 1300px) {

					.world.sun-out .large\\~time-day\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					.world.sun-out .large\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
				}
			`);
			});
		}
	});
};
