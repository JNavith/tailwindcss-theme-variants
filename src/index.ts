import { kebabCase } from "lodash";
// eslint-disable-next-line import/no-unresolved
import plugin from "tailwindcss/plugin";

import type {
	CorePlugins, PluginTools, TailwindCSSConfig, ThemeValue,
} from "@navith/tailwindcss-plugin-author-types";
import type {
	ConfigurableSemantics, ObjectOfNestedStrings, SupportedSemanticUtilities, Themes, ThisPluginOptions, ThisPluginTheme,
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

// eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-unresolved
const onTailwind2 = require("tailwindcss/package.json").version.startsWith("2.");

const DEFAULT = ["DEFAULT", "default"];
const flattenSemantics = (allThemes: [string, ThisPluginTheme][]) => allThemes.reduce(
	(semanticsAccumulating, [themeName, themeConfiguration]) => {
		Object.entries(themeConfiguration.semantics ?? {}).forEach(([utility, utilityValues]) => {
			if (!semanticsAccumulating[utility as ConfigurableSemantics]) {
				semanticsAccumulating[utility as ConfigurableSemantics] = {};
			}

			Object.entries(utilityValues ?? {}).forEach(([rootName, rootValue]) => {
				const thing = semanticsAccumulating[utility as ConfigurableSemantics];
				const flatten = ([name, value]: [string, string | ObjectOfNestedStrings]) => {
					if (typeof value === "string") {
						const computedName = DEFAULT.includes(name) ? rootName : `${rootName}-${name}`;
						if (!thing[computedName]) {
							// Use Maps to guarantee order matches theme order
							thing[computedName] = new Map();
						}
						thing[computedName].set(themeName, value);
					} else {
						Object.entries(value).forEach(([nestedName, nestedValue]) => {
							const computedName = DEFAULT.includes(nestedName) ? name : `${name}-${nestedName}`;
							flatten([computedName, nestedValue]);
						});
					}
				};

				if (typeof rootValue === "string") {
					flatten([DEFAULT[0], rootValue]);
				} else {
					Object.entries(rootValue).forEach(flatten);
				}
			});
		});

		return semanticsAccumulating;
	}, {} as Record<ConfigurableSemantics | SupportedSemanticUtilities, Record<string, Map<string, string>>>,
);

const thisPlugin = plugin.withOptions(<GivenThemes extends Themes, GroupName extends string>({
	group, themes, baseSelector: passedBaseSelector, fallback = false, utilities = {}, variables, variants = {},
}: ThisPluginOptions<GivenThemes, GroupName>) => ({
		addBase, addUtilities, addVariant, config: lookupConfig, e, postcss, theme: lookupTheme, variants: lookupVariants,
	}: PluginTools): void => {
		const allThemeNames = Object.keys(themes ?? {});
		const allThemes = Object.entries(themes ?? {});
		if (allThemes.length === 0) {
			console.warn("tailwindcss-theme-variants: no themes were given in this plugin's configuration under the `themes` key, so no variants can be generated. this can be fixed by specifying a theme like `light: { selector: '.light' }` in `themes` of this plugin's configuration. see the README for more information");
		}

		if (group && themes[group]) {
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
		const someSemantics = Object.values(themes).some((theme) => theme.semantics);
		const everySemantics = Object.values(themes).every((theme) => theme.semantics);

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

			const onlyie11 = (variables === false) || (variables === undefined && !onTailwind2);
			const noie11 = (variables === true) || (variables === undefined && onTailwind2);

			const semantics = flattenSemantics(allThemes);

			const useUnlessOverriden = (source: ConfigurableSemantics, destinations: ConfigurableSemantics[]) => {
				destinations.forEach((destination) => {
					if (semantics[source] && !semantics[destination]) {
						semantics[destination] = {};
						Object.entries(semantics?.[source] ?? {}).forEach(([sourceName, sourceConfiguration]) => {
							semantics[destination][sourceName] = sourceConfiguration;
						});
					}
				});
			};

			// Use "colors" as defaults for all the other color utilities (except "divideColor" -- see below)
			// https://github.com/tailwindlabs/tailwindcss/blob/v1.9.2/stubs/defaultConfig.stub.js#L154
			useUnlessOverriden("colors", ["backgroundColor", "borderColor", "gradientColorStops", "textColor"]);
			// And remove it from semantics (since it's not a utility)
			// @ts-expect-error delete is not allowed but we need it
			delete semantics.colors;

			// Use "borderColor" as defaults for "divideColor"
			// https://github.com/tailwindlabs/tailwindcss/blob/v1.9.2/stubs/defaultConfig.stub.js#L229
			useUnlessOverriden("borderColor", ["divideColor"]);

			// Use "opacity" as defaults for all the other opacity utilities (except "divideOpacity" -- see below)
			// https://github.com/tailwindlabs/tailwindcss/blob/v1.9.2/stubs/defaultConfig.stub.js#L188
			useUnlessOverriden("opacity", ["backgroundOpacity", "borderOpacity", "textOpacity"]);

			// Use "borderOpacity" as defaults for "divideOpacity"
			// https://github.com/tailwindlabs/tailwindcss/blob/v1.9.2/stubs/defaultConfig.stub.js#L230
			useUnlessOverriden("borderOpacity", ["divideOpacity"]);

			// TODO: implement this one
			// Use "borderWidth" as defaults for "divideWidth"
			// https://github.com/tailwindlabs/tailwindcss/blob/v1.9.2/stubs/defaultConfig.stub.js#L231
			// useUnlessOverriden("borderWidth", ["divideWidth"]);

			// Use "gradientColorStops" as values for the from-, via-, and to- utilities
			useUnlessOverriden("gradientColorStops", ["gradientFromColor", "gradientViaColor", "gradientToColor"]);
			// And remove it from semantics
			// @ts-expect-error delete is not allowed but we need it
			delete semantics.gradientColorStops;
			// If it were possible, semantics would be retyped here as Record<SupportedSemanticUtilities, Record<string, Map<string, string>>>
			// Instead, it'll be coerced where used below

			const behavior = { ...builtinUtilities, ...utilities };

			if (!onlyie11) {
				allThemes.forEach(([themeName, { mediaQuery, selector }]) => {
					const fixedBaseSelector = baseSelector || ":root";
					const semanticVariables: Record<string, string> = {};
					Object.entries(semantics ?? {}).forEach(([utilityName, utilityConfig]) => {
						Object.entries(utilityConfig ?? {}).forEach(([variable, valueMap]) => {
							if (semanticVariables[variable]) {
								throw new TypeError(`tailwindcss-theme-variants: you duplicated a semantic variable name "${variable}" across your utilities in ${themeName}'s semantics configuration (found in ${utilityName} and at least one other place). this can be fixed by using a different name for one of them`);
							}

							const referenceValue = valueMap.get(themeName);
							if (!referenceValue) {
								throw new TypeError(`tailwindcss-theme-variants: the semantic variable "${variable}" was expected to have an initial ("constant") value for the "${themeName}" theme, but it is undefined. this can be fixed by specifying a value for "${variable}" in any utility's configuration in the "semantics" object under the "${themeName}" theme's configuration`);
							}

							let lookupName = referenceValue;
							let realValue: ThemeValue;

							const allHyphensAndPeriods: number[] = [];
							for (let i = 0; i < lookupName.length; i += 1) {
								if (lookupName[i] === "." || lookupName[i] === "-") allHyphensAndPeriods.push(i);
							}

							const { configKey, disassemble } = behavior[utilityName as SupportedSemanticUtilities];

							const toTry = 2 ** allHyphensAndPeriods.length;
							[...Array(toTry).keys()].forEach((bitmap) => {
								allHyphensAndPeriods.forEach((index, bit) => {
									// eslint-disable-next-line no-bitwise
									lookupName = lookupName.substring(0, index) + (bitmap & (1 << bit) ? "." : "-") + lookupName.substring(index + 1);
								});
								const foundValue = lookupTheme(`${configKey}.${lookupName}`, undefined);
								if (foundValue) realValue = foundValue;
							});

							if (realValue) {
								semanticVariables[`--${variable}`] = disassemble(realValue);
							} else {
								throw new TypeError(`tailwindcss-theme-variants: the initial / constant value for the semantic variable named "${variable}" for the "${themeName}" theme couldn't be found; it should be named "${referenceValue}" ${referenceValue.includes(".") || referenceValue.includes("-") ? "(maybe with . in place of -?) " : ""}in \`theme.${configKey}\`. this can be fixed by making sure the value you referenced (${referenceValue}) is in your Tailwind CSS \`theme\` configuration under \`${configKey}\`.\nthere could be a mistake here; please create an issue if it actually does exist: https://github.com/JakeNavith/tailwindcss-theme-variants/issues`);
							}
						});
					});

					if (themeName === fallbackTheme) {
						if (compactFallback) {
							addBase({
								[fixedBaseSelector]: semanticVariables,
							});
						} else {
							const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => ((selector === otherSelector) ? "" : `:not(${otherSelector})`)) : [];

							addBase({
								[`${fixedBaseSelector}${inactiveThemes.join("")}`]: semanticVariables,
							});
						}
					}

					if (!compactFallback || themeName !== fallbackTheme) {
						if (mediaQuery) {
							if (fallbackTheme && baseSelector !== "") {
								const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => ((selector === otherSelector) ? "" : `:not(${otherSelector})`)) : [];

								addBase({
									[mediaQuery]: {
										[`${fixedBaseSelector}${inactiveThemes.join("")}`]: semanticVariables,
									},
								});
							} else {
								addBase({
									[mediaQuery]: {
										[`${fixedBaseSelector}`]: semanticVariables,
									},
								});
							}
						}
						if (selector) {
							addBase({
								[`${fixedBaseSelector}${selector}`]: semanticVariables,
							});
						}
					}
				});
			}

			Object.entries(semantics as Record<SupportedSemanticUtilities, Record<string, Map<string, string>>>).forEach(([utility, utilityConfiguration]) => {
				const { configKey, prefix: classPrefix } = behavior[utility as SupportedSemanticUtilities];
				// If it's a core plugin and it's not enabled, return early (and do nothing)
				if (!isUtilityEnabled(configKey)) {
					// But if it's a user-defined utility, stay in
					if (!utilities[configKey]) return;
				}

				const allVariants = lookupVariants(configKey, []);
				// Drop theme variants from these utilities because they won't work
				const dedupedVariants = allVariants.filter((variant) => !allThemeNames.includes(variant) && variant !== group && allThemeNames.every((themeName) => !variant.startsWith(`${themeName}:`)) && !variant.startsWith(`${group}:`));

				const hasAllThemeVariants = (group ? (allVariants as string[]).includes(group) : false) || allThemeNames.every((themeName) => (allVariants as string[]).includes(themeName));

				if (!noie11 && !hasAllThemeVariants) {
					console.warn(`tailwindcss-theme-variants: ${onlyie11 ? "" : "the IE11 compatible "}semantic utility classes for the "${utility}" utility could not generate because the variants needed did not exist. this can be fixed by listing the theme group variant "${group}" in the \`variants.${configKey}\` array in your Tailwind CSS configuration. there is no way to silence this warning, so if you don't care, ignore it`);
					if (onlyie11) {
						return;
					}
				}

				Object.entries(utilityConfiguration).forEach(([semanticName, sourcePerTheme]) => {
					const classesToApply = Array.from(sourcePerTheme.entries()).map(([themeName, sourceName]) => {
						const wholePrefix = `${themeName}${separator}${lookupConfig("prefix", "")}${classPrefix}`;
						if (DEFAULT.includes(sourceName)) return wholePrefix;
						return `${wholePrefix}-${sourceName}`;
					});

					const computedClass = DEFAULT.includes(semanticName) ? `.${e(classPrefix)}` : `.${e(`${classPrefix}-${semanticName}`)}`;
					if (!noie11 && hasAllThemeVariants) {
						addUtilities({
							[computedClass]: {
								[`@apply ${classesToApply.join(" ")}`]: "",
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
	themes, utilities, variables,
}: ThisPluginOptions<GivenThemes, GroupName>) => {
		const everySemantics = Object.values(themes).every((theme) => theme.semantics);

		const extendedConfig: TailwindCSSConfig & { theme: { extend: NonNullable<TailwindCSSConfig["theme"]> } } = {
			theme: {
				extend: {},
			},
		};

		if (everySemantics) {
			if (!onTailwind2) {
				console.warn("tailwindcss-theme-variants: because you're using the `semantics` feature, the experimental Tailwind feature `applyComplexClasses` was enabled for you (there is no way to silence this warning)");
				console.warn("tailwindcss-theme-variants: you should see a warning from Tailwind core explaining so below:");

				extendedConfig.experimental = {
					applyComplexClasses: true,
				};
			}

			const behavior = { ...builtinUtilities, ...utilities };

			const onlyie11 = (variables === false) || (variables === undefined && !onTailwind2);
			const noie11 = (variables === true) || (variables === undefined && onTailwind2);

			const allThemes = Object.entries(themes ?? {});
			const semantics = flattenSemantics(allThemes);

			if (!onlyie11) {
				Object.entries(semantics).forEach(([configKey, themeMaps]) => {
					extendedConfig.theme.extend[configKey] = {};

					const { reassemble } = behavior[configKey as SupportedSemanticUtilities];
					Object.keys(themeMaps).forEach((semanticName) => {
						const reassembled = reassemble(`var(--${semanticName})`);
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore it's typed wrong
						extendedConfig.theme.extend[configKey][semanticName] = noie11 ? reassembled : (...args) => `${reassembled(...args)} !important`;
					});
				});
			}
		}

		return extendedConfig;
	});

export default thisPlugin;
export const tailwindcssThemeVariants = thisPlugin;
export const themeVariants = thisPlugin;

export * from "./media-queries";
export * from "./supports";
export * from "./variants";
