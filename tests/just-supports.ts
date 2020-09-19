import { describe, it } from "mocha";

import thisPlugin, { noSupportsGrid, supportsGrid } from "../src/index";
import { assertExactCSS, generatePluginCSS } from "./_utils";

export const justSupports = (): void => {
	describe("just @supports", () => {
		it("works in place of media queries", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					gridTemplateRows: {
						0: "none",
						2: "two",
					},
				},
				corePlugins: ["gridTemplateRows"],
				variants: {
					gridTemplateRows: ["can-grid", "no-grid"],
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

		it("supports compact fallback all the same", async () => {
			assertExactCSS(await generatePluginCSS({
				theme: {
					gridTemplateColumns: {
						0: "none",
						2: "two",
					},
				},
				corePlugins: ["gridTemplateColumns"],
				variants: {
					gridTemplateColumns: ["gridability"],
				},

				plugins: [
					thisPlugin({
						group: "gridability",
						themes: {
							"cant-grid": {
								mediaQuery: noSupportsGrid,
							},
							"has-grid": {
								mediaQuery: supportsGrid,
							},
						},
						fallback: "compact",
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
