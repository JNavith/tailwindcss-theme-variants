import { describe, it } from "mocha";

import { themeVariants as thisPlugin } from "tailwindcss-theme-variants";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const justSelectors = (): void => {
	describe("just selectors", () => {
		it("works in the most basic way without fallback", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"theme-light",
					"theme-dark",
					"bg-red",
					"light2n2yrg287:bg-red",
					"dark2n2yrg287:bg-red",
				],
				theme: {
					backgroundColor: {
						red: "#FF0000",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						themes: {
							light2n2yrg287: { selector: ".theme-light" },
							dark2n2yrg287: { selector: ".theme-dark" },
						},
					}),
				],
			}),
			`
				.bg-red {
					--tw-bg-opacity: 1;
					background-color: rgb(255 0 0 / var(--tw-bg-opacity));
				}

				html.theme-light .light2n2yrg287\\:bg-red {
					--tw-bg-opacity: 1;
					background-color: rgb(255 0 0 / var(--tw-bg-opacity));
				}

				html.theme-dark .dark2n2yrg287\\:bg-red {
					--tw-bg-opacity: 1;
					background-color: rgb(255 0 0 / var(--tw-bg-opacity));
				}
			`);
		});

		it("works the way the basic usage example with selectors says it will", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"light-theme",
					"dark-theme",
					"bg-gray-900",
					"light891239htj3:bg-gray-900",
					"dark891239htj3:bg-gray-900",
				],
				theme: {
					backgroundColor: {
						"gray-900": "#1A202C",
					},
				},
				plugins: [
					thisPlugin({
						themes: {
							light891239htj3: {
								selector: ".light-theme",
							},
							dark891239htj3: {
								selector: ".dark-theme",
							},
						},
					}),
				],
			}),
			`
				.bg-gray-900 {
					--tw-bg-opacity: 1;
					background-color: rgb(26 32 44 / var(--tw-bg-opacity));
				}

				:root.light-theme .light891239htj3\\:bg-gray-900 {
					--tw-bg-opacity: 1;
					background-color: rgb(26 32 44 / var(--tw-bg-opacity));
				}

				:root.dark-theme .dark891239htj3\\:bg-gray-900 {
					--tw-bg-opacity: 1;
					background-color: rgb(26 32 44 / var(--tw-bg-opacity));
				}
			`);
		});

		it("works in the most basic way with fallback", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"theme-light",
					"theme-base",
					"theme-dark",
					"bg-green",
					"light33:bg-green",
					"base33:bg-green",
					"dark33:bg-green",
				],
				theme: {
					backgroundColor: {
						green: "#00FF00",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: "html",
						fallback: true,
						themes: {
							light33: { selector: ".theme-light" },
							base33: { selector: ".theme-base" },
							dark33: { selector: ".theme-dark" },
						},
					}),
				],
			}),
			`
				.bg-green {
					--tw-bg-opacity: 1;
					background-color: rgb(0 255 0 / var(--tw-bg-opacity));
				}

				html .light33\\:bg-green {
					--tw-bg-opacity: 1;
					background-color: rgb(0 255 0 / var(--tw-bg-opacity));
				}

				html.theme-base .base33\\:bg-green {
					--tw-bg-opacity: 1;
					background-color: rgb(0 255 0 / var(--tw-bg-opacity));
				}
				
				html.theme-dark .dark33\\:bg-green {
					--tw-bg-opacity: 1;
					background-color: rgb(0 255 0 / var(--tw-bg-opacity));
				}
			`);
		});

		it("works the way the basic usage example with selectors with fallback says it will", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"bg-gray-900",
					"dark8iu237y5978236:bg-gray-900",
					"light8iu237y5978236:bg-gray-900",
				],
				theme: {
					backgroundColor: {
						"gray-900": "#1A202C",
					},
				},
				plugins: [
					thisPlugin({
						themes: {
							dark8iu237y5978236: {
								selector: ".dark-theme",
							},
							light8iu237y5978236: {
								selector: ".light-theme",
							},
						},
						fallback: true,
					}),
				],
			}),
			`
				.bg-gray-900 {
					--tw-bg-opacity: 1;
					background-color: rgb(26 32 44 / var(--tw-bg-opacity));
				}

				:root .dark8iu237y5978236\\:bg-gray-900 {
					--tw-bg-opacity: 1;
					background-color: rgb(26 32 44 / var(--tw-bg-opacity));
				}

				:root.light-theme .light8iu237y5978236\\:bg-gray-900 {
					--tw-bg-opacity: 1;
					background-color: rgb(26 32 44 / var(--tw-bg-opacity));
				}
			`);
		});

		it("supports stacked variants (active and hover)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"red-theme",
					"blue-theme",
					"bg-yellow",
					"red832597238967:bg-yellow",
					"red832597238967:active:bg-yellow",
					"red832597238967:hover:bg-yellow",
					"blue832597238967:bg-yellow",
					"blue832597238967:active:bg-yellow",
					"blue832597238967:hover:bg-yellow",
				],
				theme: {
					backgroundColor: {
						yellow: "#FFFF00",
					},
				},
				plugins: [
					thisPlugin({
						baseSelector: "body",
						themes: {
							red832597238967: { selector: ".red-theme" },
							blue832597238967: { selector: ".blue-theme" },
						},
					}),
				],
			}),
			`
				.bg-yellow {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}

				body.red-theme .red832597238967\\:bg-yellow {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.red-theme .red832597238967\\:hover\\:bg-yellow:hover {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.red-theme .red832597238967\\:active\\:bg-yellow:active {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}

				body.blue-theme .blue832597238967\\:bg-yellow {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.blue-theme .blue832597238967\\:hover\\:bg-yellow:hover {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.blue-theme .blue832597238967\\:active\\:bg-yellow:active {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
			`);
		});

		it("supports stacked variants (visited)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"bg-electron",
					"solarized-light",
					"solarized-dark",
					"solarized-light-theme:bg-electron",
					"solarized-dark-theme:bg-electron",
					"solarized-light-theme:visited:bg-electron",
					"solarized-dark-theme:visited:bg-electron",
				],
				theme: {
					backgroundColor: {
						electron: "#18E",
					},
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
					--tw-bg-opacity: 1;
					background-color: rgb(17 136 238 / var(--tw-bg-opacity));
				}

				body.solarized-light .solarized-light-theme\\:bg-electron {
					--tw-bg-opacity: 1;
					background-color: rgb(17 136 238 / var(--tw-bg-opacity));
				}
				body.solarized-light .solarized-light-theme\\:visited\\:bg-electron:visited {
					--tw-bg-opacity: 1;
					background-color: rgb(17 136 238 / var(--tw-bg-opacity));
				}

				body.solarized-dark .solarized-dark-theme\\:bg-electron {
					--tw-bg-opacity: 1;
					background-color: rgb(17 136 238 / var(--tw-bg-opacity));
				}
				body.solarized-dark .solarized-dark-theme\\:visited\\:bg-electron:visited {
					--tw-bg-opacity: 1;
					background-color: rgb(17 136 238 / var(--tw-bg-opacity));
				}
			`);
		});

		it("supports grouping to reduce redundancy with typing out variants", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"red-theme",
					"blue-theme",
					"bg-yellow",
					"red:bg-yellow",
					"blue:bg-yellow",
					"red:hover:bg-yellow",
					"blue:hover:bg-yellow",
					"red:active:bg-yellow",
					"blue:active:bg-yellow",
				],
				theme: {
					backgroundColor: {
						yellow: "#FFFF00",
					},
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
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}

				body.red-theme .red\\:bg-yellow {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.red-theme .red\\:hover\\:bg-yellow:hover {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.red-theme .red\\:active\\:bg-yellow:active {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}

				body.blue-theme .blue\\:bg-yellow {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.blue-theme .blue\\:hover\\:bg-yellow:hover {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
				body.blue-theme .blue\\:active\\:bg-yellow:active {
					--tw-bg-opacity: 1;
					background-color: rgb(255 255 0 / var(--tw-bg-opacity));
				}
			`);
		});

		it("supports data attribute selectors", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"data-padding-personalized",
					"data-padding",
					"compact",
					"comfortable",
					"cozy",
					"p-0",
					"p-4",
					"p-8",
					"compact:p-0",
					"compact:p-4",
					"compact:p-8",
					"comfortable:p-0",
					"comfortable:p-4",
					"comfortable:p-8",
					"cozy:p-0",
					"cozy:p-4",
					"cozy:p-8",
				],
				theme: {
					padding: {
						0: "0",
						4: "1rem",
						8: "2rem",
					},
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
				.p-0 {
					padding: 0;
				}
				.p-4 {
					padding: 1rem;
				}
				.p-8 {
					padding: 2rem;
				}

				[data-padding-personalized][data-padding=compact] .compact\\:p-0 {
					padding: 0;
				}
				[data-padding-personalized][data-padding=compact] .compact\\:p-4 {
					padding: 1rem;
				}
				[data-padding-personalized][data-padding=compact] .compact\\:p-8 {
					padding: 2rem;
				}

				[data-padding-personalized][data-padding=comfortable] .comfortable\\:p-0 {
					padding: 0;
				}
				[data-padding-personalized][data-padding=comfortable] .comfortable\\:p-4 {
					padding: 1rem;
				}
				[data-padding-personalized][data-padding=comfortable] .comfortable\\:p-8 {
					padding: 2rem;
				}

				[data-padding-personalized][data-padding=cozy] .cozy\\:p-0 {
					padding: 0;
				}
				[data-padding-personalized][data-padding=cozy] .cozy\\:p-4 {
					padding: 1rem;
				}
				[data-padding-personalized][data-padding=cozy] .cozy\\:p-8 {
					padding: 2rem;
				}
			`);
		});

		// TODO: fix (I believe it's within my control)
		const groupHoverWorks2 = false;
		if (groupHoverWorks2) {
			it("supports group hover and focus variants and `baseSelector` defaults to `:root`", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"low-contrast",
						"high-contrast",
						"group",
						"opacity-50",
						"opacity-100",
						"low-contrast:group-hover:opacity-50",
						"low-contrast:group-hover:opacity-100",
						"high-contrast:group-hover:opacity-50",
						"high-contrast:group-hover:opacity-100",
						"low-contrast:group-focus:opacity-50",
						"low-contrast:group-focus:opacity-100",
						"high-contrast:group-focus:opacity-50",
						"high-contrast:group-focus:opacity-100",
					],
					theme: {
						opacity: {
							50: 0.5,
							100: 1,
						},
					},
					plugins: [
						thisPlugin({
							themes: {
								"low-contrast": { selector: ".low-contrast" },
								"high-contrast": { selector: ".high-contrast" },
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
		}

		it("supports even child variants with fallback (text color)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"high-contrast",
					"low-contrast",
					"text-orange",
					"text-cyan",
					"high-contrast:text-orange",
					"high-contrast:text-cyan",
					"low-contrast:text-orange",
					"low-contrast:text-cyan",
					"high-contrast:even:text-orange",
					"high-contrast:even:text-cyan",
					"low-contrast:even:text-orange",
					"low-contrast:even:text-cyan",
				],
				theme: {
					textColor: {
						orange: "#F80",
						cyan: "#0FF",
					},
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
					--tw-text-opacity: 1;
					color: rgb(255 136 0 / var(--tw-text-opacity));
				}
				.text-cyan {
					--tw-text-opacity: 1;
					color: rgb(0 255 255 / var(--tw-text-opacity));
				}

				:root .high-contrast\\:text-orange {
					--tw-text-opacity: 1;
					color: rgb(255 136 0 / var(--tw-text-opacity));
				}
				:root .high-contrast\\:text-cyan {
					--tw-text-opacity: 1;
					color: rgb(0 255 255 / var(--tw-text-opacity));
				}
				:root .high-contrast\\:even\\:text-orange:nth-child(even) {
					--tw-text-opacity: 1;
					color: rgb(255 136 0 / var(--tw-text-opacity));
				}
				:root .high-contrast\\:even\\:text-cyan:nth-child(even) {
					--tw-text-opacity: 1;
					color: rgb(0 255 255 / var(--tw-text-opacity));
				}

				:root.low-contrast .low-contrast\\:text-orange {
					--tw-text-opacity: 1;
					color: rgb(255 136 0 / var(--tw-text-opacity));
				}
				:root.low-contrast .low-contrast\\:text-cyan {
					--tw-text-opacity: 1;
					color: rgb(0 255 255 / var(--tw-text-opacity));
				}
				:root.low-contrast .low-contrast\\:even\\:text-orange:nth-child(even) {
					--tw-text-opacity: 1;
					color: rgb(255 136 0 / var(--tw-text-opacity));
				}
				:root.low-contrast .low-contrast\\:even\\:text-cyan:nth-child(even) {
					--tw-text-opacity: 1;
					color: rgb(0 255 255 / var(--tw-text-opacity));
				}
			`);
		});

		it("supports even child variants with fallback (border color)", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"high-contrast",
					"low-contrast",
					"border-cyan",
					"high-contrast:border-cyan",
					"low-contrast:border-cyan",
					"high-contrast:even:border-cyan",
					"low-contrast:even:border-cyan",
				],
				theme: {
					borderColor: {
						cyan: "#0FF",
					},
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
				.border-cyan {
					--tw-border-opacity: 1;
					border-color: rgb(0 255 255 / var(--tw-border-opacity));
				}

				:root .high-contrast\\:border-cyan {
					--tw-border-opacity: 1;
					border-color: rgb(0 255 255 / var(--tw-border-opacity));
				}

				:root .high-contrast\\:even\\:border-cyan:nth-child(even) {
					--tw-border-opacity: 1;
					border-color: rgb(0 255 255 / var(--tw-border-opacity));
				}

				:root.low-contrast .low-contrast\\:border-cyan {
					--tw-border-opacity: 1;
					border-color: rgb(0 255 255 / var(--tw-border-opacity));
				}

				:root.low-contrast .low-contrast\\:even\\:border-cyan:nth-child(even) {
					--tw-border-opacity: 1;
					border-color: rgb(0 255 255 / var(--tw-border-opacity));
				}
			`);
		});

		it("supports unstacked responsive variants", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"themed",
					"amoled",
					"text-teal",
					"amoled:text-teal",
					"sm:text-teal",
					"sm:amoled:text-teal",
					"md:text-teal",
					"md:amoled:text-teal",
					"lg:text-teal",
					"lg:amoled:text-teal",
				],
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
					--tw-text-opacity: 1;
					color: rgb(0 255 170 / var(--tw-text-opacity));
				}

				.themed.amoled .amoled\\:text-teal {
					--tw-text-opacity: 1;
					color: rgb(0 255 170 / var(--tw-text-opacity));
				}

				@media (min-width: 200px) {
					.sm\\:text-teal {
						--tw-text-opacity: 1;
						color: rgb(0 255 170 / var(--tw-text-opacity));
					}

					.themed.amoled .sm\\:amoled\\:text-teal {
						--tw-text-opacity: 1;
						color: rgb(0 255 170 / var(--tw-text-opacity));
					}
				}

				@media (min-width: 400px) {
					.md\\:text-teal {
						--tw-text-opacity: 1;
						color: rgb(0 255 170 / var(--tw-text-opacity));
					}

					.themed.amoled .md\\:amoled\\:text-teal {
						--tw-text-opacity: 1;
						color: rgb(0 255 170 / var(--tw-text-opacity));
					}
				}

				@media (min-width: 600px) {
					.lg\\:text-teal {
						--tw-text-opacity: 1;
						color: rgb(0 255 170 / var(--tw-text-opacity));
					}

					.themed.amoled .lg\\:amoled\\:text-teal {
						--tw-text-opacity: 1;
						color: rgb(0 255 170 / var(--tw-text-opacity));
					}
				}
			`);
		});

		const groupHoverWorks = false;
		if (groupHoverWorks) {
			it("supports stacked responsive variants", async () => {
				assertExactCSS(await generatePluginCSS({
					safelist: [
						"theme",
						"winter",
						"group",
						"mobile:border-gray",
						"mobile:winter:border-gray",
						"mobile:winter:focus:border-gray",
						"mobile:winter:group-hover:border-gray",
						"desktop:border-gray",
						"desktop:winter:border-gray",
						"desktop:winter:focus:border-gray",
						"desktop:winter:group-hover:border-gray",
					],
					theme: {
						borderColor: {
							gray: "#678",
						},
						screens: {
							mobile: "300px",
							desktop: "500px",
						},
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
				@media (min-width: 300px) {
					.mobile\\:border-gray {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}

					:root.theme.winter .mobile\\:winter\\:border-gray {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}

					:root.theme.winter .mobile\\:winter\\:focus\\:border-gray:focus {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}

					:root.theme.winter .group:hover .mobile\\:winter\\:group-hover\\:border-gray {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}
				}

				@media (min-width: 500px) {
					.desktop\\:border-gray {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}

					:root.theme.winter .desktop\\:winter\\:border-gray {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}

					:root.theme.winter .desktop\\:winter\\:focus\\:border-gray:focus {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}

					:root.theme.winter .group:hover .desktop\\:winter\\:group-hover\\:border-gray {
						--tw-border-opacity: 1;
						border-color: rgb(102 119 136 / var(--tw-border-opacity));
					}
				}
			`);
			});
		}

		it("supports the new provided selection variant", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"light",
					"dark",
					"bg-red-500",
					"light9218549:selection:bg-red-500",
					"dark9218549:selection:bg-red-500",
				],
				theme: {
					backgroundColor: {
						"red-500": "#F56565",
					},
				},
				plugins: [
					thisPlugin({
						themes: {
							light9218549: {
								selector: ".light",
							},
							dark9218549: {
								selector: ".dark",
							},
						},
					}),
				],
			}),
			`
				.bg-red-500 {
					--tw-bg-opacity: 1;
					background-color: rgb(245 101 101 / var(--tw-bg-opacity));
				}

				:root.light .light9218549\\:selection\\:bg-red-500 *::selection {
					--tw-bg-opacity: 1;
					background-color: rgb(245 101 101 / var(--tw-bg-opacity));
				}

				:root.light .light9218549\\:selection\\:bg-red-500::selection {
					--tw-bg-opacity: 1;
					background-color: rgb(245 101 101 / var(--tw-bg-opacity));
				}

				:root.dark .dark9218549\\:selection\\:bg-red-500 *::selection {
					--tw-bg-opacity: 1;
					background-color: rgb(245 101 101 / var(--tw-bg-opacity));
				}

				:root.dark .dark9218549\\:selection\\:bg-red-500::selection {
					--tw-bg-opacity: 1;
					background-color: rgb(245 101 101 / var(--tw-bg-opacity));
				}
			`);
		});
	});
};
