import { kebabCase } from "lodash";
import plugin from "tailwindcss/plugin";
import { toRgba } from "tailwindcss/lib/util/withAlphaVariable";

import type { CorePlugins, PluginTools } from "@navith/tailwindcss-plugin-author-types";
import type {
	ConfigurableSemantics, SupportedSemanticUtilities, Themes, ThisPluginOptions,
} from "./types";
import { addParent } from "./selectors";
import * as builtinUtilities from "./utilities";
import * as builtinVariants from "./variants";

const nameVariant = (themeName: string, variantName: string): string => {
	if (variantName === "") {
		return themeName;
	}
	return `${themeName}:${variantName}`;
};

const defaultVariants: {
	[name: string]: (selector: string) => string;
} = Object.fromEntries(Object.entries(builtinVariants).map(([variantName, variantFunction]) => [kebabCase(variantName), variantFunction]));

const thisPlugin = plugin.withOptions(<GivenThemes extends Themes, GroupName extends string>({
	group, themes, baseSelector: passedBaseSelector, fallback = false, variants = {},
}: ThisPluginOptions<GivenThemes, GroupName>) => ({
		addUtilities, addVariant, config: lookupConfig, e, postcss, target: lookupTarget, theme: lookupTheme, variants: lookupVariants,
	}: PluginTools): void => {
		const allThemeNames = Object.keys(themes ?? {});
		const allThemes = Object.entries(themes ?? {});
		if (allThemes.length === 0) {
			console.warn("tailwindcss-theme-variants: no themes were given in this plugin's configuration under the `themes` key, so no variants can be generated. this can be fixed by specifying a theme like `light: { selector: '.light' }` in `themes` of this plugin's configuration. see the README for more information");
		}

		if (group && Object.prototype.hasOwnProperty.call(themes, group)) {
			throw new TypeError(`tailwindcss-theme-variants: a group of themes was named "${group}" even though there is already a theme named that in \`themes\`. this can be fixed by removing or changing the name of \`group\` in this plugin's configuration`);
		}

		const fallbackTheme = fallback ? allThemes[0][0] : undefined;
		const compactFallback = fallback === "compact";

		const usesAnySelectors = allThemes.some(([_name, { selector }]) => selector);

		// Implicitly disable `baseSelector` on behalf of the person only using media queries to set their themes
		// Otherwise use :root as the default `baseSelector`
		const baseSelector = passedBaseSelector ?? (usesAnySelectors ? ":root" : "");

		if (fallbackTheme !== undefined) {
			if (allThemes.length === 1) {
				if (baseSelector === "") {
					console.warn(`tailwindcss-theme-variants: the "${fallbackTheme}" theme was selected for fallback, but it is the only one available, so it will always be active, which is unusual. this can be "fixed" by adding another theme to \`themes\` in this plugin's configuration, disabling \`fallback\` in this plugin's configuration, or setting a \`baseSelector\` in this plugin's configuration (there is no way to silence this warning)`);
				} else {
					console.warn(`tailwindcss-theme-variants: the "${fallbackTheme}" theme was selected for fallback, but it is the only one available, so it will always be active as long as \`${baseSelector}\` exists. this is an unusual pattern, so if you meant not to do this, it can be "fixed" by adding another theme to \`themes\` in this plugin's configuration, disabling \`fallback\` in this plugin's configuration, or changing \`baseSelector\` to \`""\` and setting this theme's \`selector\` to the current value of \`baseSelector\` (there is no way to silence this warning)`);
				}
			}

			if (usesAnySelectors && baseSelector === "") {
				console.warn(`tailwindcss-theme-variants: the "${fallbackTheme}" theme was selected for fallback, but you specified \`baseSelector: ""\` even though you use theme(s) that need a selector to activate, which will result in confusing and erroneous behavior of when themes activate. this can be fixed by disabling \`fallback\` in this plugin's configuration, or setting a \`baseSelector\` in this plugin's configuration (there is no way to silence this warning)`);
			}
		}

		// Begin variants logic

		// Use a normal default variant first
		Object.entries({ "": (selector: string): string => selector, ...defaultVariants, ...variants }).forEach(([variantName, variantFunction]) => {
			const toRegister = group ? [...allThemes, [group, { mediaQuery: "", selector: "" }] as typeof allThemes[0]] : allThemes;
			toRegister.forEach(([rootTheme, themeConfig]) => {
				const namedVariant = nameVariant(rootTheme, variantName);

				addVariant(namedVariant, ({ container, separator }) => {
					const originalContainer = container.clone();
					// Remove the pre-existing (provided by Tailwind's core) CSS so that we don't duplicate it
					container.removeAll();

					(rootTheme === group ? allThemes : [[rootTheme, themeConfig]] as typeof allThemes).forEach(([themeName, { mediaQuery, selector }]) => {
						const nameSelector = (ruleSelector: string): string => `${variantFunction(`.${e(`${nameVariant(themeName, variantName).replace(/:/g, separator)}${separator}`)}${ruleSelector.slice(1)}`)}`;

						if (themeName === fallbackTheme) {
							const containerFallBack = originalContainer.clone();

							containerFallBack.walkRules((rule) => {
								const namedSelector = nameSelector(rule.selector);
								if (compactFallback) {
									rule.selector = addParent(namedSelector, baseSelector);
								} else {
									const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => ((selector === otherSelector) ? "" : `:not(${otherSelector})`)) : [];
									rule.selector = addParent(namedSelector, `${baseSelector}${inactiveThemes.join("")}`);
								}
							});

							container.append(containerFallBack);
						}

						// When fallback is being compacted, only generate the regular cases for the non-fallback-theme
						if (!compactFallback || themeName !== fallbackTheme) {
							if (mediaQuery) {
								const queryAtRule = postcss.parse(mediaQuery).first;

								// Nest the utilities inside the given media query
								const queryContainer = originalContainer.clone();
								queryContainer.walkRules((rule) => {
									const namedSelector = nameSelector(rule.selector);
									if (fallbackTheme && baseSelector !== "") {
										const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => ((selector === otherSelector) ? "" : `:not(${otherSelector})`)) : [];
										rule.selector = addParent(namedSelector, `${baseSelector}${inactiveThemes.join("")}`);
									} else {
										rule.selector = namedSelector;
									}
								});

								if (queryAtRule?.type === "atrule") {
									if (queryContainer.nodes) {
										queryAtRule.append(queryContainer.nodes);
									}

									container.append(queryAtRule);
								} else {
									throw new TypeError(`tailwindcss-theme-variants: the media query passed to ${themeName}'s \`mediaQuery\` option (\`${mediaQuery}\`) is not a valid media query. this can be fixed by passing a valid media query there instead (lol)`);
								}
							}

							if (selector) {
								const normalScreenContainer = originalContainer.clone();
								normalScreenContainer.walkRules((rule) => {
									const namedSelector = nameSelector(rule.selector);
									const activator = `${baseSelector}${selector}`;
									rule.selector = addParent(namedSelector, activator);
								});

								container.append(normalScreenContainer);
							}
						}
					});
				});
			});
		});
		// End variants logic

		// Begin semantics logic
		const someSemantics = Object.values(themes).some((theme) => Object.prototype.hasOwnProperty.call(theme, "semantics"));
		const everySemantics = Object.values(themes).every((theme) => Object.prototype.hasOwnProperty.call(theme, "semantics"));

		if (everySemantics) {
			const separator = lookupConfig("separator", ":");
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const corePlugins: CorePlugins = lookupConfig("corePlugins", {}) as any;

			const isUtilityEnabled = (utility: string): boolean => {
				let utilityEnabled = true;
				if (corePlugins === true) utilityEnabled = true;
				else if (corePlugins === false) utilityEnabled = false;
				else if (Array.isArray(corePlugins)) utilityEnabled = corePlugins.includes(utility);
				else if (corePlugins[utility] === false) utilityEnabled = false;

				return utilityEnabled;
			};

			const semantics = allThemes.reduce(
				(semanticsAccumulating, [themeName, themeConfiguration]) => {
					Object.entries(themeConfiguration.semantics ?? {}).forEach(([utility, utilityValues]) => {
						if (!Object.prototype.hasOwnProperty.call(semanticsAccumulating, utility)) {
							semanticsAccumulating[utility as ConfigurableSemantics] = {};
						}

						Object.entries(utilityValues ?? {}).forEach(([valueName, value]) => {
							const thing = semanticsAccumulating[utility as ConfigurableSemantics];
							if (typeof value === "string") {
								if (!Object.prototype.hasOwnProperty.call(thing, valueName)) {
									// Use Maps to guarantee order matches theme order
									thing[valueName] = new Map();
								}
								thing[valueName].set(themeName, value);
							} else {
								// TODO: flattening logic
								console.log({ value });
							}
						});
					});

					return semanticsAccumulating;
				}, {} as Record<ConfigurableSemantics | SupportedSemanticUtilities, Record<string, Map<string, string>>>,
			);

			// TODO: same logic for gradientColorStops and opacity
			const colorUtilities: SupportedSemanticUtilities[] = ["backgroundColor", "borderColor", "divideColor", "textColor"];
			// Use "colors" as defaults for all the other color utilities and remove it from semantics
			Object.entries(semantics?.colors ?? {}).forEach(([colorName, colorConfiguration]) => {
				colorUtilities.forEach((colorUtility) => {
					if (!Object.prototype.hasOwnProperty.call(semantics, colorUtility)) {
						semantics[colorUtility] = {};
					}

					if (!Object.prototype.hasOwnProperty.call(semantics[colorUtility], colorName)) {
						semantics[colorUtility][colorName] = colorConfiguration;
					}
				});
			});

			// If it were possible, semantics would be retyped here as Record<SupportedSemanticUtilities, Record<string, Map<string, string>>>
			// Instead, it'll be coerced where used below

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete semantics.colors;

			// TODO: support for user-defined utilities
			const behavior = builtinUtilities;

			const target = lookupTarget("themeVariants");
			const onlyie11 = target === "ie11";
			// @ts-expect-error: doesn't work yet, but might in the future
			const noie11 = target === "modern";

			// TODO: make this work
			// if (!ie11) {
			// addBase({
			// ":root.light-theme": {
			// // TODO: don't hardcode
			// "--primary": doSomethingWith(toRgba(theme("colors.white")));
			// // ... for each semantic variable
			// })
			// addBase({
			// ":root.dark-theme": {
			// // TODO: don't hardcode
			// "--primary": doSomethingWith(toRgba(theme("colors.gray.900")));
			// // ... for each semantic variable
			// })
			// }

			Object.entries(semantics as Record<SupportedSemanticUtilities, Record<string, Map<string, string>>>).forEach(([utility, utilityConfiguration]) => {
				Object.entries(utilityConfiguration).forEach(([semanticName, sourcePerTheme]) => {
					if (!isUtilityEnabled(utility)) return;

					const allVariants = lookupVariants(utility, []);
					// Drop theme variants from these utilities because they won't work
					const dedupedVariants = allVariants.filter((variant) => !allThemeNames.includes(variant) && variant !== group);

					const classesToApply = Array.from(sourcePerTheme.entries()).map(([themeName, sourceName]) => `${themeName}${separator}${behavior[utility as SupportedSemanticUtilities].className({ name: sourceName })}`);
					const {
						className, opacityUtility, opacityVariable, property, selector,
					} = behavior[utility as SupportedSemanticUtilities];

					const computedClass = `.${e(className({ name: semanticName }))}`;
					addUtilities({
						[computedClass]: {
							// Only use @apply
							// eslint-disable-next-line no-nested-ternary
							...((noie11 ? (opacityUtility ? isUtilityEnabled(opacityUtility) : true) : true) ? {
								[`@apply ${classesToApply.join(" ")}`]: "",
							} : {}),
						},
					}, dedupedVariants);

					const computedSelector = selector ? selector({ name: semanticName }) : computedClass;
					const computedValue = opacityVariable ? `rgba(var(--${semanticName}), var(--${opacityVariable}, 1))` : `var(--${semanticName})`;
					if (!onlyie11) {
						addUtilities({
							[computedSelector]: {
								[property ?? utility]: `${computedValue} !important`,
							},
						}, dedupedVariants);
					}
				});
			});
		} else if (someSemantics) {
			throw new TypeError("tailwindcss-theme-variants: either all themes must define `semantics` or none do. this can be fixed by TODO");
		}
		// End semantics logic
	},

	<GivenThemes extends Themes, GroupName extends string>({
	themes,
}: ThisPluginOptions<GivenThemes, GroupName>) => {
		const everySemantics = Object.values(themes).every((theme) => Object.prototype.hasOwnProperty.call(theme, "semantics"));

		if (everySemantics) {
			console.warn("tailwindcss-theme-variants: because you're using the `semantics` feature, the experimental Tailwind feature `applyComplexClasses` was enabled for you (there is no way to silence this warning)");
			console.warn("tailwindcss-theme-variants: you should see a warning from Tailwind core explaining so below:");

			return {
				experimental: {
					applyComplexClasses: true,
				},
			};
		}

		return {};
	});

export default thisPlugin;
export const tailwindcssThemeVariants = thisPlugin;
export const themeVariants = thisPlugin;

export * from "./media-queries";
export * from "./supports";
export * from "./variants";
