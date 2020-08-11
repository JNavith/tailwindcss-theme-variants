import { TailwindCSSConfig } from "@navith/tailwindcss-plugin-author-types";
import assert from "assert";
import cssMatcher from "jest-matcher-css";
import { flatMap, merge } from "lodash";
import { describe, it } from "mocha";
import postcss from "postcss";
import { createSandbox } from "sinon";
import tailwindcss from "tailwindcss";

import thisPlugin, {
	active, disabled, even, first, focus, groupHover, groupFocus, hover, last, odd, prefersAnyMotion, prefersReducedMotion, prefersReducedTransparency, prefersAnyTransparency, prefersDark, prefersLight, prefersAnyContrast, prefersLowContrast, prefersHighContrast, selection, visited,
} from "../src/index";
import { distill, addParent } from "../src/selectors";

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
	const { pass, message }: {pass: boolean, message: () => string} = cssMatcher(actual, expected);
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

	describe("#addParent()", () => {
		it("adds `a` to `b`", () => {
			assert.equal(addParent("a", "b"), "b a");
		});

		it("adds `.parent` to `.child`", () => {
			assert.equal(addParent(".child", ".parent"), ".parent .child");
		});

		it("adds nothing to `.parentless`", () => {
			assert.equal(addParent(".parentless", ""), ".parentless");
		});

		it("adds `#parent` to every `.child{n}`", () => {
			assert.equal(addParent(".child1, .child2, .child3", "#parent"), "#parent .child1, #parent .child2, #parent .child3");
		});

		it("adds `grandparent [parent]` to `child:hover` and `child .grandchild`", () => {
			assert.equal(addParent("child:hover, child .grandchild", "grandparent [parent]"), "grandparent [parent] child:hover, grandparent [parent] child .grandchild");
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

		it("supports media queries with fallback (and warns about the unusual fallback setup)", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

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

			assert.ok(consoleStub.calledWithExactly("tailwindcss-theme-variants: the \"dark\" theme was selected for fallback, but it is the only one available, so it will always be active as long as `html` exists. this is an unusual pattern, so if you meant not to do this, it can be \"fixed\" by adding another theme to `themes` in this plugin's configuration, disabling `fallback` in this plugin's configuration, or changing `baseSelector` to `\"\"` and setting this theme's `selector` to the current value of `baseSelector` (there is no way to silence this warning)"), "the plugin didn't warn when it was supposed to");
			sandbox.restore();
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

		it("supports grouping to reduce redundancy with typing out variants", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						yellow: "#FFFF00",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["themes", "themes:hover", "themes:active"],
				},
				plugins: [
					thisPlugin({
						baseSelector: "body",
						themes: {
							red: { selector: ".red-theme" },
							blue: { selector: ".blue-theme" },
						},
						group: "themes",
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

				body.blue-theme .blue\\:bg-yellow {
					background-color: #FFFF00;
				}

				body.red-theme .red\\:hover\\:bg-yellow:hover {
					background-color: #FFFF00;
				}

				body.blue-theme .blue\\:hover\\:bg-yellow:hover {
					background-color: #FFFF00;
				}

				body.red-theme .red\\:active\\:bg-yellow:active {
					background-color: #FFFF00;
				}

				body.blue-theme .blue\\:active\\:bg-yellow:active {
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

		it("supports group hover and focus variants (with grouping) and `baseSelector` defaults to `html`", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					opacity: {
						50: 0.5,
						100: 1,
					},
				},
				corePlugins: ["opacity"],
				variants: {
					opacity: ["contrast:group-hover", "contrast:group-focus"],
				},
				plugins: [
					thisPlugin({
						themes: {
							"low-contrast": { selector: ".low-contrast" },
							"high-contrast": { selector: ".high-contrast" },
						},
						group: "contrast",
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

				:root.high-contrast .group:hover .high-contrast\\:group-hover\\:opacity-50 {
					opacity: 0.5;
				}

				:root.high-contrast .group:hover .high-contrast\\:group-hover\\:opacity-100 {
					opacity: 1;
				}

				:root.low-contrast .group:focus .low-contrast\\:group-focus\\:opacity-50 {
					opacity: 0.5;
				}

				:root.low-contrast .group:focus .low-contrast\\:group-focus\\:opacity-100 {
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

		it("supports even child variants with fallback", async () => {
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
						themes: {
							"high-contrast": { selector: ".high-contrast" },
							"low-contrast": { selector: ".low-contrast" },
						},
						fallback: true,
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

		it("supports grouping even child variants with fallback", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					textColor: {
						orange: "#F80",
						cyan: "#0FF",
					},
				},
				corePlugins: ["textColor"],
				variants: {
					textColor: ["level-contrast", "level-contrast:even"],
				},
				plugins: [
					thisPlugin({
						themes: {
							"high-contrast": { selector: ".high-contrast" },
							"low-contrast": { selector: ".low-contrast" },
						},
						group: "level-contrast",
						fallback: true,
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

				
				:root.low-contrast .low-contrast\\:text-orange {
					color: #F80;
				}

				:root.low-contrast .low-contrast\\:text-cyan {
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


				:root.low-contrast .low-contrast\\:even\\:text-orange:nth-child(even) {
					color: #F80;
				}

				:root.low-contrast .low-contrast\\:even\\:text-cyan:nth-child(even) {
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

		it("supports user-defined variants", async () => {
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
						themes: {
							"solarized-light-theme": { selector: ".solarized-light" },
							"solarized-dark-theme": { selector: ".solarized-dark" },
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

		it("supports user-defined variants with grouping", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						electron: "#18E",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["solarized", "solarized:visited"],
				},
				plugins: [
					thisPlugin({
						group: "solarized",
						baseSelector: "body",
						themes: {
							"solarized-light-theme": { selector: ".solarized-light" },
							"solarized-dark-theme": { selector: ".solarized-dark" },
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
						themes: {
							"normal-motion": { mediaQuery: prefersAnyMotion },
							"reduced-motion": { mediaQuery: prefersReducedMotion },
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

		it("supports media queries without selectors and implicit empty baseSelector and with stacking variants and grouping", async () => {
			assertCSS(await generatePluginCss({
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

		it("supports the new provided selection variant", async () => {
			assertCSS(await generatePluginCss({
				theme: {
					backgroundColor: {
						"red-500": "#F56565",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["light:selection", "dark:selection"],
				},

				plugins: [
					thisPlugin({
						themes: {
							light: {
								selector: ".light",
							},
							dark: {
								selector: ".dark",
							},
						},
						variants: {
							selection,
						},
					}),
				],
			}),
			`
				.bg-red-500 {
					background-color: #F56565;
				}

				:root.light .light\\:selection\\:bg-red-500::selection, :root.light .light\\:selection\\:bg-red-500 ::selection {
					background-color: #F56565;
				}

				:root.dark .dark\\:selection\\:bg-red-500::selection, :root.dark .dark\\:selection\\:bg-red-500 ::selection {
					background-color: #F56565;
				}
			`);
		});

		it("supports the new provided selection variant with fallback without a baseSelector (because it was implicitly disabled)", async () => {
			assertCSS(await generatePluginCss({
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
						variants: {
							selection,
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

		it("works the way the basic usage example with media queries with fallback says it will", async () => {
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
						fallback: true,
					}),
				],
			}),
			`
				.bg-teal-500 {
					background-color: #38B2AC;
				}

				.light\\:bg-teal-500 {
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

		it("works the way the basic usage example with selectors with fallback says it will", async () => {
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
							dark: {
								selector: ".dark-theme",
							},
							light: {
								selector: ".light-theme",
							},
						},
						fallback: true,
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

				:root:not(.light-theme) .dark\\:bg-gray-900 {
					background-color: #1A202C;
				}

				:root.dark-theme .dark\\:bg-gray-900 {
					background-color: #1A202C;
				}
			`);
		});

		it("warns you about using `baseSelector: ''` with selectors and fallback", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

			await generatePluginCss({
				theme: {
					backgroundColor: {
						"gray-900": "#1A202C",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["red", "green"],
				},

				plugins: [
					thisPlugin({
						themes: {
							red: {
								selector: ".red",
							},
							green: {
								selector: ".green",
							},
						},
						baseSelector: "",
						fallback: true,
					}),
				],
			});

			assert.ok(consoleStub.calledWithExactly("tailwindcss-theme-variants: the \"red\" theme was selected for fallback, but you specified `baseSelector: \"\"` even though you use theme(s) that need a selector to activate, which will result in confusing and erroneous behavior of when themes activate. this can be fixed by disabling `fallback` in this plugin's configuration, or setting a `baseSelector` in this plugin's configuration (there is no way to silence this warning)"), "the plugin didn't warn when it was supposed to");
			sandbox.restore();
		});

		it("errors at you for naming the theme group the same as any theme", async () => {
			try {
				await generatePluginCss({
					theme: {},

					plugins: [
						thisPlugin({
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							group: "green",
							themes: {
								red: {
									selector: ".red",
								},
								green: {
									selector: ".green",
								},
							},
						}),
					],
				});

				assert.fail("the plugin never threw");
			} catch (e) {
				assert.equal(e.message, "tailwindcss-theme-variants: a group of themes was named \"green\" even though there is already a theme named that in `themes`. this can be fixed by removing or changing the name of `group` in this plugin's configuration");
			}
		});
	});
});
