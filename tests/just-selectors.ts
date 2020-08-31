import { describe, it } from "mocha";

import thisPlugin from "../src/index";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const justSelectors = (): void => {
	describe("just selectors", () => {
		it("works in the most basic way without fallback", async () => {
			assertExactCSS(await generatePluginCSS({
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

		it("works the way the basic usage example with selectors says it will", async () => {
			assertExactCSS(await generatePluginCSS({
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

		it("works in the most basic way with fallback", async () => {
			assertExactCSS(await generatePluginCSS({
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

		it("works the way the basic usage example with selectors with fallback says it will", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					backgroundColor: {
						"gray-900": "#1A202C",
					},
				},
				corePlugins: ["backgroundColor"],
				variants: {
					backgroundColor: ["dark", "light"],
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

				:root:not(.light-theme) .dark\\:bg-gray-900 {
					background-color: #1A202C;
				}

				:root.dark-theme .dark\\:bg-gray-900 {
					background-color: #1A202C;
				}

				:root.light-theme .light\\:bg-gray-900 {
					background-color: #1A202C;
				}
			`);
		});

		it("supports variants", async () => {
			assertExactCSS(await generatePluginCSS({
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

		it("supports user-defined variants", async () => {
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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

		it("supports grouping to reduce redundancy with typing out variants", async () => {
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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
			assertExactCSS(await generatePluginCSS({
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

		it("supports the new provided selection variant", async () => {
			assertExactCSS(await generatePluginCSS({
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
	});
};
