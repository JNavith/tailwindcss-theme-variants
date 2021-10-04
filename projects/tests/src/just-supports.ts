import { describe, it } from "mocha";

import {
	themeVariants as thisPlugin,
	noSupportsGrid, supportsGrid,
} from "tailwindcss-theme-variants";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const justSupports = (): void => {
	describe("just @supports", () => {
		it("works in place of media queries", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"grid-rows-0",
					"grid-rows-2",
					"can-grid:grid-rows-0",
					"can-grid:grid-rows-2",
					"no-grid:grid-rows-0",
					"no-grid:grid-rows-2",
				],

				theme: {
					gridTemplateRows: {
						0: "none",
						2: "two",
					},
				},

				plugins: [
					thisPlugin({
						themes: {
							"can-grid": {
								mediaQuery: supportsGrid,
							},
							"no-grid": {
								mediaQuery: noSupportsGrid,
							},
						},
					}),
				],
			}),
			`
				.grid-rows-0 {
					grid-template-rows: none;
				}
				.grid-rows-2 {
      				grid-template-rows: two;
				}
				
				@supports (display: grid) {
					.can-grid\\:grid-rows-0 {
						grid-template-rows: none;
					}
					.can-grid\\:grid-rows-2 {
						grid-template-rows: two;
					}
				}

				@supports not (display: grid) {
					.no-grid\\:grid-rows-0 {
						grid-template-rows: none;
					}
					.no-grid\\:grid-rows-2 {
						grid-template-rows: two;
					}
				}
			`);
		});

		it("supports fallback all the same", async () => {
			assertExactCSS(await generatePluginCSS({
				safelist: [
					"grid-cols-0",
					"grid-cols-2",
					"cant-grid:grid-cols-0",
					"cant-grid:grid-cols-2",
					"has-grid:grid-cols-0",
					"has-grid:grid-cols-2",
				],
				theme: {
					gridTemplateColumns: {
						0: "none",
						2: "two",
					},
				},
				plugins: [
					thisPlugin({
						themes: {
							"cant-grid": {
								mediaQuery: noSupportsGrid,
							},
							"has-grid": {
								mediaQuery: supportsGrid,
							},
						},
						fallback: true,
					}),
				],
			}),
			`
				.grid-cols-0 {
					grid-template-columns: none;
				}
				.grid-cols-2 {
      				grid-template-columns: two;
				}

				.cant-grid\\:grid-cols-0 {
					grid-template-columns: none;
				}
				.cant-grid\\:grid-cols-2 {
					grid-template-columns: two;
				}
				
				@supports (display: grid) {
					.has-grid\\:grid-cols-0 {
						grid-template-columns: none;
					}
					.has-grid\\:grid-cols-2 {
						grid-template-columns: two;
					}
				}
			`);
		});
	});
};
