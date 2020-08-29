import { flatMap } from "lodash";
import { describe, it } from "mocha";

import thisPlugin, { disabled, odd, prefersDark, prefersLight } from "../src/index";
import { assertCSS, generatePluginCss } from "./_utils";

export const bothSelectorsAndMediaQueries = () => {
    describe("both selectors and media queries", () => {
        
		it("supports media queries without fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						blue: "#0000FF",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["light"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						themes: {
							light: { selector: ".light", mediaQuery: prefersLight },
						},
					}),
				],
			}),
			`
				.bg-blue {
					background-color: #0000FF;
				}

				@media (prefers-color-scheme: light) {
					.light\\:bg-blue {
						background-color: #0000FF;
					}
				}

				html.light .light\\:bg-blue {
					background-color: #0000FF;
				}
			`);
        });
        


		it("supports media queries with fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						pink: "#FF00FF",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["dark"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						fallback: true,
						themes: {
							dark: { selector: ".theme-dark", mediaQuery: prefersDark },
						},
					}),
				],
			}),
			`
				.bg-pink {
					background-color: #FF00FF;
				}

				html .dark\\:bg-pink {
					background-color: #FF00FF;
				}

				@media (prefers-color-scheme: dark) {
					html .dark\\:bg-pink {
						background-color: #FF00FF;
					}
				}

				html.theme-dark .dark\\:bg-pink {
					background-color: #FF00FF;
				}
			`);
		});


		it("supports responsive variants with user-defined media queries", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						"dark-gray": "#123",
					},
					screens: {
						tiny: "100px",
						huge: "900px",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["responsive", "white"],
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
					background-color: #123;
				}

				@media (prefers-color-scheme: light) {
					.white\\:bg-dark-gray {
						background-color: #123;
					}
				}

				:root.white .white\\:bg-dark-gray {
					background-color: #123;
				}

				@media (min-width: 100px) {
					.tiny\\:bg-dark-gray {
						background-color: #123;
					}

					@media (prefers-color-scheme: light) {
						.tiny\\:white\\:bg-dark-gray {
							background-color: #123;
						}
					}

					:root.white .tiny\\:white\\:bg-dark-gray {
						background-color: #123;
					}
				}

				@media (min-width: 900px) {
					.huge\\:bg-dark-gray {
						background-color: #123;
					}

					@media (prefers-color-scheme: light) {
						.huge\\:white\\:bg-dark-gray {
							background-color: #123;
						}
					}

					:root.white .huge\\:white\\:bg-dark-gray {
						background-color: #123;
					}
				}
			`);
		});



		it("supports unstacked responsive variants and user-defined media queries and boolean fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					textColor: {
						brown: "#640",
					},
					screens: {
						middle: "600px",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["responsive", "theme-light", "theme-dark"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						fallback: true,
						themes: {
							"theme-light": { selector: ".light-theme", mediaQuery: prefersLight },
							"theme-dark": { selector: ".dark-theme", mediaQuery: prefersDark },
						},
					}),
				],
			}),
			`
				.text-brown {
					color: #640;
				}

				html:not(.dark-theme) .theme-light\\:text-brown {
					color: #640;
				}

				@media (prefers-color-scheme: light) {
					html:not(.dark-theme) .theme-light\\:text-brown {
						color: #640;
					}
				}

				html.light-theme .theme-light\\:text-brown {
					color: #640;
				}

				@media (prefers-color-scheme: dark) {
					html:not(.light-theme) .theme-dark\\:text-brown {
						color: #640;
					}
				}

				html.dark-theme .theme-dark\\:text-brown {
					color: #640;
				}

				@media (min-width: 600px) {
					.middle\\:text-brown {
						color: #640;
					}
					
					html:not(.dark-theme) .middle\\:theme-light\\:text-brown {
						color: #640;
					}

					@media (prefers-color-scheme: light) {
						html:not(.dark-theme) .middle\\:theme-light\\:text-brown {
							color: #640;
						}
					}

					html.light-theme .middle\\:theme-light\\:text-brown {
						color: #640;
					}

					@media (prefers-color-scheme: dark) {
						html:not(.light-theme) .middle\\:theme-dark\\:text-brown {
							color: #640;
						}
					}

					html.dark-theme .middle\\:theme-dark\\:text-brown {
						color: #640;
					}
				}
			`);
		});



		it("(OMG) supports stacked responsive variants and partial use of user-defined media queries and fallback and custom separator", async () => {
			assertCSS(await generatePluginCss({
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
				corePlugins: ["stroke"],
				variants: {
					// Early way to do `group` of themes
					stroke: ["responsive", ...flatMap(["disabled", "odd"], (stackedVariant: string): string[] => [`time-day:${stackedVariant}`, `time-night:${stackedVariant}`])],
				},
				plugins: [
					thisPlugin({
						baseSelector: ".world",
						themes: {
							"time-night": { selector: ".moon-out" },
							"time-day": { selector: ".sun-out", mediaQuery: prefersLight },
						},
						fallback: true,
						variants: {
							disabled,
							odd,
						},
					}),
				],
			}),
			`
				.stroke-cream {
					stroke: #FED;
				}

				@media (prefers-color-scheme: light) {
					.world:not(.moon-out) .time-day\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}
				}

				.world.sun-out .time-day\\~disabled\\~stroke-cream:disabled {
					stroke: #FED;
				}

				.world:not(.sun-out) .time-night\\~disabled\\~stroke-cream:disabled {
					stroke: #FED;
				}

				.world.moon-out .time-night\\~disabled\\~stroke-cream:disabled {
					stroke: #FED;
				}

				@media (prefers-color-scheme: light) {
					.world:not(.moon-out) .time-day\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
				}

				.world.sun-out .time-day\\~odd\\~stroke-cream:nth-child(odd) {
					stroke: #FED;
				}

				.world:not(.sun-out) .time-night\\~odd\\~stroke-cream:nth-child(odd) {
					stroke: #FED;
				}

				.world.moon-out .time-night\\~odd\\~stroke-cream:nth-child(odd) {
					stroke: #FED;
				}

				@media (min-width: 400px) {
					.small\\~stroke-cream {
						stroke: #FED;
					}

					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .small\\~time-day\\~disabled\\~stroke-cream:disabled {
							stroke: #FED;
						}
					}

					.world.sun-out .small\\~time-day\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					.world:not(.sun-out) .small\\~time-night\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					.world.moon-out .small\\~time-night\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .small\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
							stroke: #FED;
						}
					}

					.world.sun-out .small\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}

					.world:not(.sun-out) .small\\~time-night\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
					
					.world.moon-out .small\\~time-night\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
				}

				@media (min-width: 1300px) {
					.large\\~stroke-cream {
						stroke: #FED;
					}

					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .large\\~time-day\\~disabled\\~stroke-cream:disabled {
							stroke: #FED;
						}
					}

					.world.sun-out .large\\~time-day\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					.world:not(.sun-out) .large\\~time-night\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					.world.moon-out .large\\~time-night\\~disabled\\~stroke-cream:disabled {
						stroke: #FED;
					}

					@media (prefers-color-scheme: light) {
						.world:not(.moon-out) .large\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
							stroke: #FED;
						}
					}

					.world.sun-out .large\\~time-day\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}

					.world:not(.sun-out) .large\\~time-night\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}

					.world.moon-out .large\\~time-night\\~odd\\~stroke-cream:nth-child(odd) {
						stroke: #FED;
					}
				}
			`);
		});


    });
}