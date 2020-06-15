import assert from "assert";
import cssMatcher from "jest-matcher-css";
import { flatMap, merge } from "lodash";
import { describe, it } from "mocha";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

import thisPlugin, {
	active, disabled, even, first, focus, groupHover, groupFocus, hover, last, odd, prefersAnyMotion, prefersReducedMotion, prefersReducedTransparency, prefersAnyTransparency, prefersDark, prefersLight, prefersAnyContrast, prefersLowContrast, prefersHighContrast, visited,
} from "../src/index";
import { distill } from "../src/selectors";
import { TailwindCSSConfig } from "../src/types";

const generatePluginCss = (config: TailwindCSSConfig): Promise<string> => postcss(
	tailwindcss(
		merge({
			theme: {},
			corePlugins: false,
		} as TailwindCSSConfig, config),
	),
).process("@tailwind utilities", {
	from: undefined,
}).then((result) => result.css);

const assertCSS = (actual: string, expected: string): void => {
	const { pass, message } = cssMatcher(actual, expected);
	assert.ok(pass, message());
};

describe("tailwindcss-theme-variants", () => {
	describe("#distill()", () => {
		it("gives ['html', ['.theme-light', '.theme-dark']] for ['html.theme-light', 'html.theme-dark']", () => {
			assert.deepEqual(distill(["html.theme-light", "html.theme-dark"]), ["html", [".theme-light", ".theme-dark"]]);
		});

		it("gives ['html.theme', ['.light', '.dark']] for ['html.theme.light', 'html.theme.dark']", () => {
			assert.deepEqual(distill(["html.theme.light", "html.theme.dark"]), ["html.theme", [".light", ".dark"]]);
		});

		it("gives ['body', ['[data-theme=light]', '[data-theme=dark]']] for ['body[data-theme=light]', 'body[data-theme=dark]']", () => {
			assert.deepEqual(distill(["body[data-theme=light]", "body[data-theme=dark]"]), ["body", ["[data-theme=light]", "[data-theme=dark]"]]);
		});
	});


	describe("#thisPlugin()", () => {
		it("works in the most basic way without fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						red: "#FF0000",
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
							light: { selector: ".theme-light" },
							dark: { selector: ".theme-dark" },
						},
					}),
				],
			}),
			`
				.bg-red {
					background-color: #FF0000;
				}

				html.theme-light .light\\:bg-red {
					background-color: #FF0000;
				}

				html.theme-dark .dark\\:bg-red {
					background-color: #FF0000;
				}
			`);
		});

		it("works in the most basic way with fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						green: "#00FF00",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["light", "dark"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						fallback: true,
						themes: {
							light: { selector: ".theme-light" },
							dark: { selector: ".theme-dark" },
						},
					}),
				],
			}),
			`
				.bg-green {
					background-color: #00FF00;
				}

				html:not(.theme-dark) .light\\:bg-green {
					background-color: #00FF00;
				}
				
				html.theme-light .light\\:bg-green {
					background-color: #00FF00;
				}
				
				html.theme-dark .dark\\:bg-green {
					background-color: #00FF00;
				}
			`);
		});

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

		it("supports variants", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						yellow: "#FFFF00",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["red", "red:active", "red:hover", "blue", "blue:active", "blue:hover"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "body",
						themes: {
							red: { selector: ".red-theme" },
							blue: { selector: ".blue-theme" },
						},
						variants: {
							active,
							hover,
						},
					}),
				],
			}),
			`
				.bg-yellow {
					background-color: #FFFF00;
				}

				body.red-theme .red\\:bg-yellow {
					background-color: #FFFF00;
				}

				body.red-theme .red\\:active\\:bg-yellow:active {
					background-color: #FFFF00;
				}

				body.red-theme .red\\:hover\\:bg-yellow:hover {
					background-color: #FFFF00;
				}

				body.blue-theme .blue\\:bg-yellow {
					background-color: #FFFF00;
				}

				body.blue-theme .blue\\:active\\:bg-yellow:active {
					background-color: #FFFF00;
				}

				body.blue-theme .blue\\:hover\\:bg-yellow:hover {
					background-color: #FFFF00;
				}
			`);
		});

		it("supports data attribute selectors", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					// Pretend this is padding, which would've generated too many utilities to write a test case
					fontSize: {
						0: 0,
						4: "1rem",
						8: "2rem",
					},
				},
				corePlugins: ["fontSize"],
				variants: {
					fontSize: ["compact", "comfortable", "cozy"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "[data-padding-personalized]",
						themes: {
							compact: { selector: "[data-padding=compact]" },
							comfortable: { selector: "[data-padding=comfortable]" },
							cozy: { selector: "[data-padding=cozy]" },
						},
					}),
				],
			}),
			`
				.text-0 {
					font-size: 0;
				}
				.text-4 {
					font-size: 1rem;
				}
				.text-8 {
					font-size: 2rem;
				}

				[data-padding-personalized][data-padding=compact] .compact\\:text-0 {
					font-size: 0;
				}
				[data-padding-personalized][data-padding=compact] .compact\\:text-4 {
					font-size: 1rem;
				}
				[data-padding-personalized][data-padding=compact] .compact\\:text-8 {
					font-size: 2rem;
				}

				[data-padding-personalized][data-padding=comfortable] .comfortable\\:text-0 {
					font-size: 0;
				}
				[data-padding-personalized][data-padding=comfortable] .comfortable\\:text-4 {
					font-size: 1rem;
				}
				[data-padding-personalized][data-padding=comfortable] .comfortable\\:text-8 {
					font-size: 2rem;
				}

				[data-padding-personalized][data-padding=cozy] .cozy\\:text-0 {
					font-size: 0;
				}
				[data-padding-personalized][data-padding=cozy] .cozy\\:text-4 {
					font-size: 1rem;
				}
				[data-padding-personalized][data-padding=cozy] .cozy\\:text-8 {
					font-size: 2rem;
				}
			`);
		});

		it("supports group hover and focus variants and `baseSelector` defaults to `html`", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					opacity: {
						50: 0.5,
						100: 1,
					},
				},
				corePlugins: ["opacity"],
				variants: {
					opacity: ["low-contrast:group-hover", "low-contrast:group-focus", "high-contrast:group-hover", "high-contrast:group-focus"],
				},
				plugins: [
					thisPlugin({
						themes: {
							"high-contrast": { selector: ".high-contrast" },
							"low-contrast": { selector: ".low-contrast" },
						},
						variants: {
							"group-focus": groupFocus,
							"group-hover": groupHover,
						},
					}),
				],
			}),
			`
				.opacity-50 {
					opacity: 0.5;
				}

				.opacity-100 {
					opacity: 1;
				}

				:root.low-contrast .group:hover .low-contrast\\:group-hover\\:opacity-50 {
					opacity: 0.5;
				}

				:root.low-contrast .group:hover .low-contrast\\:group-hover\\:opacity-100 {
					opacity: 1;
				}

				:root.low-contrast .group:focus .low-contrast\\:group-focus\\:opacity-50 {
					opacity: 0.5;
				}

				:root.low-contrast .group:focus .low-contrast\\:group-focus\\:opacity-100 {
					opacity: 1;
				}

				:root.high-contrast .group:hover .high-contrast\\:group-hover\\:opacity-50 {
					opacity: 0.5;
				}

				:root.high-contrast .group:hover .high-contrast\\:group-hover\\:opacity-100 {
					opacity: 1;
				}

				:root.high-contrast .group:focus .high-contrast\\:group-focus\\:opacity-50 {
					opacity: 0.5;
				}

				:root.high-contrast .group:focus .high-contrast\\:group-focus\\:opacity-100 {
					opacity: 1;
				}
			`);
		});

		it("supports even child variants with string fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					textColor: {
						orange: "#F80",
						cyan: "#0FF",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["low-contrast", "low-contrast:even", "high-contrast", "high-contrast:even"],
				},
				plugins: [
					thisPlugin({
						fallback: "high-contrast",
						themes: {
							"low-contrast": { selector: ".low-contrast" },
							"high-contrast": { selector: ".high-contrast" },
						},
						variants: {
							even,
						},
					}),
				],
			}),
			`
				.text-orange {
					color: #F80;
				}

				.text-cyan {
					color: #0FF;
				}

				
				:root.low-contrast .low-contrast\\:text-orange {
					color: #F80;
				}

				:root.low-contrast .low-contrast\\:text-cyan {
					color: #0FF;
				}


				:root.low-contrast .low-contrast\\:even\\:text-orange:nth-child(even) {
					color: #F80;
				}

				:root.low-contrast .low-contrast\\:even\\:text-cyan:nth-child(even) {
					color: #0FF;
				}


				:root:not(.low-contrast) .high-contrast\\:text-orange {
					color: #F80;
				}

				:root:not(.low-contrast) .high-contrast\\:text-cyan {
					color: #0FF;
				}


				:root.high-contrast .high-contrast\\:text-orange {
					color: #F80;
				}

				:root.high-contrast .high-contrast\\:text-cyan {
					color: #0FF;
				}


				:root:not(.low-contrast) .high-contrast\\:even\\:text-orange:nth-child(even) {
					color: #F80;
				}

				:root:not(.low-contrast) .high-contrast\\:even\\:text-cyan:nth-child(even) {
					color: #0FF;
				}

				:root.high-contrast .high-contrast\\:even\\:text-orange:nth-child(even) {
					color: #F80;
				}

				:root.high-contrast .high-contrast\\:even\\:text-cyan:nth-child(even) {
					color: #0FF;
				}
			`);
		});

		it("supports unstacked responsive variants", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					textColor: {
						teal: "#0FA",
					},
					screens: {
						sm: "200px",
						md: "400px",
						lg: "600px",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["responsive", "amoled"],
				},
				plugins: [
					thisPlugin({
						baseSelector: ".themed",
						themes: {
							amoled: { selector: ".amoled" },
						},
					}),
				],
			}),
			`
				.text-teal {
					color: #0FA;
				}

				.themed.amoled .amoled\\:text-teal {
					color: #0FA;
				}

				@media (min-width: 200px) {
					.sm\\:text-teal {
						color: #0FA;
					}

					.themed.amoled .sm\\:amoled\\:text-teal {
						color: #0FA;
					}
				}

				@media (min-width: 400px) {
					.md\\:text-teal {
						color: #0FA;
					}

					.themed.amoled .md\\:amoled\\:text-teal {
						color: #0FA;
					}
				}

				@media (min-width: 600px) {
					.lg\\:text-teal {
						color: #0FA;
					}

					.themed.amoled .lg\\:amoled\\:text-teal {
						color: #0FA;
					}
				}
			`);
		});

		it("supports stacked responsive variants", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					borderColor: {
						gray: "#678",
					},
					screens: {
						mobile: "300px",
						desktop: "500px",
					},
				},
				corePlugins: ["borderColor"],
				variants: {
					borderColor: ["responsive", "winter", "winter:focus", "winter:group-hover"],
				},
				plugins: [
					thisPlugin({
						themes: {
							winter: { selector: ".theme.winter" },
						},
						variants: {
							focus,
							"group-hover": groupHover,
						},
					}),
				],
			}),
			`
				.border-gray  {
					border-color: #678;
				}

				:root.theme.winter .winter\\:border-gray {
					border-color: #678;
				}

				:root.theme.winter .winter\\:focus\\:border-gray:focus {
					border-color: #678;
				}

				:root.theme.winter .group:hover .winter\\:group-hover\\:border-gray {
					border-color: #678;
				}

				@media (min-width: 300px) {
					.mobile\\:border-gray {
						border-color: #678;
					}

					:root.theme.winter .mobile\\:winter\\:border-gray {
						border-color: #678;
					}

					:root.theme.winter .mobile\\:winter\\:focus\\:border-gray:focus {
						border-color: #678;
					}

					:root.theme.winter .group:hover .mobile\\:winter\\:group-hover\\:border-gray {
						border-color: #678;
					}
				}

				@media (min-width: 500px) {
					.desktop\\:border-gray {
						border-color: #678;
					}

					:root.theme.winter .desktop\\:winter\\:border-gray {
						border-color: #678;
					}

					:root.theme.winter .desktop\\:winter\\:focus\\:border-gray:focus {
						border-color: #678;
					}

					:root.theme.winter .group:hover .desktop\\:winter\\:group-hover\\:border-gray {
						border-color: #678;
					}
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

		it("supports prefixing theme name with unstacked responsive variants and user-defined media queries and boolean fallback", async () => {
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
						rename: (themeName: string): string => `theme-${themeName}`,
						themes: {
							light: { selector: ".light-theme", mediaQuery: prefersLight },
							dark: { selector: ".dark-theme", mediaQuery: prefersDark },
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

		it("(OMG) supports prefixing theme name with stacked responsive variants and partial use of user-defined media queries and string fallback and custom separator", async () => {
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
					stroke: ["responsive", ...flatMap(["disabled", "odd"], (stackedVariant: string): string[] => [`time-day:${stackedVariant}`, `time-night:${stackedVariant}`])],
				},
				plugins: [
					thisPlugin({
						baseSelector: ".world",
						rename: (themeName: string): string => `time-${themeName}`,
						fallback: "night",
						themes: {
							day: { selector: ".sun-out", mediaQuery: prefersLight },
							night: { selector: ".moon-out" },
						},
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

		it("supports renaming with a suffix and user-defined variants", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						electron: "#18E",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["solarized-light-theme", "solarized-dark-theme", "solarized-light-theme:visited", "solarized-dark-theme:visited"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "body",
						rename: (themeName: string) => `${themeName}-theme`,
						themes: {
							"solarized-light": { selector: ".solarized-light" },
							"solarized-dark": { selector: ".solarized-dark" },
						},
						variants: {
							visited,
						},
					}),
				],
			}),
			`
				.bg-electron {
					background-color: #18E;
				}

				body.solarized-light .solarized-light-theme\\:bg-electron {
					background-color: #18E;
				}

				body.solarized-dark .solarized-dark-theme\\:bg-electron {
					background-color: #18E;
				}

				body.solarized-light .solarized-light-theme\\:visited\\:bg-electron:visited {
					background-color: #18E;
				}

				body.solarized-dark .solarized-dark-theme\\:visited\\:bg-electron:visited {
					background-color: #18E;
				}
			`);
		});

		it("supports media queries without selectors with fallback", async () => {
			assertCSS(await generatePluginCss({
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
			assertCSS(await generatePluginCss({
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
						rename: (themeName: string) => `${themeName}-contrast`,
						themes: {
							normal: { mediaQuery: prefersAnyContrast },
							low: { mediaQuery: prefersLowContrast },
							high: { mediaQuery: prefersHighContrast },
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
			assertCSS(await generatePluginCss({
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
						rename: (themeName: string): string => `${themeName}-motion`,
						themes: {
							normal: { mediaQuery: prefersAnyMotion },
							reduced: { mediaQuery: prefersReducedMotion },
						},
						variants: {
							first,
							last,
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
			assertCSS(await generatePluginCss({
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
						rename: (themeName: string): string => `${themeName}-theme`,
						themes: {
							light: { mediaQuery: prefersLight },
							dark: { mediaQuery: prefersDark },
						},
					}),
					thisPlugin({
						baseSelector: "",
						rename: (themeName: string): string => `${themeName}-motion`,
						themes: {
							reduced: { mediaQuery: prefersReducedMotion },
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

				:root .light-theme\\:bg-berry {
					background-color: #B37;
				}

				:root .light-theme\\:bg-bush {
					background-color: #073;
				}

				@media (prefers-color-scheme: light) {
					:root .light-theme\\:bg-berry {
						background-color: #B37
					}

					:root .light-theme\\:bg-bush {
						background-color: #073
					}
				}

				@media (prefers-color-scheme: dark) {
					:root .dark-theme\\:bg-berry {
						background-color: #B37
					}

					:root .dark-theme\\:bg-bush {
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


		it("works the way the basic usage example with selectors says it will", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						"gray-900": "#1A202C",
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
								selector: ".light-theme",
							},
							dark: {
								selector: ".dark-theme",
							},
						},
					}),
				],
			}),
			`
				.bg-gray-900 {
					background-color: #1A202C;
				}

				:root.light-theme .light\\:bg-gray-900 {
					background-color: #1A202C;
				}

				:root.dark-theme .dark\\:bg-gray-900 {
					background-color: #1A202C;
				}
			`);
		});

		it("works the way the basic usage example with media queries says it will", async () => {
			assertCSS(await generatePluginCss({
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
	});
});
