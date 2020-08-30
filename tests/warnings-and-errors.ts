import assert from "assert";
import { describe, it } from "mocha";
import { createSandbox } from "sinon";

import thisPlugin, { prefersDark } from "../src/index";
import { generatePluginCSS } from "./_utils";

export const warningsAndErrors = (): void => {
	describe("warnings and errors", () => {
		it("warns unusual fallback setups with just 1 theme listed", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

			await generatePluginCSS({
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
			});

			assert.ok(consoleStub.calledWithExactly("tailwindcss-theme-variants: the \"dark\" theme was selected for fallback, but it is the only one available, so it will always be active as long as `html` exists. this is an unusual pattern, so if you meant not to do this, it can be \"fixed\" by adding another theme to `themes` in this plugin's configuration, disabling `fallback` in this plugin's configuration, or changing `baseSelector` to `\"\"` and setting this theme's `selector` to the current value of `baseSelector` (there is no way to silence this warning)"), "the plugin didn't warn when it was supposed to");
			sandbox.restore();
		});

		it("warns you about using `baseSelector: ''` with selectors and fallback", async () => {
			const sandbox = createSandbox();
			const consoleStub = sandbox.stub(console, "warn");

			await generatePluginCSS({
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
				await generatePluginCSS({
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
};
