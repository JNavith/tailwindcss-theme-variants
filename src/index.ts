import { AtRule } from "postcss";
import plugin from "tailwindcss/plugin";

import { CorePlugins, PluginTools } from "@navith/tailwindcss-plugin-author-types";
import {
	ConfigurableSemantics, SupportedSemanticUtilities, Themes, ThisPluginOptions,
} from "./types";
import { addParent } from "./selectors";

const nameVariant = (themeName: string, variantName: string): string => {
	if (variantName === "") {
		return themeName;
	}
	return `${themeName}:${variantName}`;
};

const thisPlugin = plugin.withOptions(<GivenThemes extends Themes, GroupName extends string>({
	group, themes, baseSelector, fallback = false, variants = {},
}: ThisPluginOptions<GivenThemes, GroupName>) => ({
		addUtilities, addVariant, config: lookupConfig, e, postcss, variants: lookupVariants,
	}: PluginTools): void => {
		const allThemeNames = Object.keys(themes ?? {});
		const allThemes = Object.entries(themes ?? {});
		if (allThemes.length === 0) {
			console.warn("tailwindcss-theme-variants: no themes were given in this plugin's configuration under the `themes` key, so no variants can be generated. this can be fixed by specifying a theme like `light: { selector: '.light' }` in `themes` of this plugin's configuration. see the README for more information");
		}

		if (group && Object.prototype.hasOwnProperty.call(themes, group)) {
			throw new TypeError(`tailwindcss-theme-variants: a group of themes was named "${group}" even though there is already a theme named that in \`themes\`. this can be fixed by removing or changing the name of \`group\` in this plugin's configuration`);
		}

		// eslint-disable-next-line no-nested-ternary
		const fallbackTheme = (fallback === true) ? allThemes[0][0] : (fallback === false ? undefined : fallback);

		const usesAnySelectors = allThemes.some(([_name, { selector }]) => selector);

		if (baseSelector === undefined) {
			// Implicitly disable `baseSelector` on behalf of the person only using media queries to set their themes
			// Otherwise use :root as the default `baseSelector`
			// eslint-disable-next-line no-param-reassign
			baseSelector = usesAnySelectors ? ":root" : "";
		}

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
		Object.entries({ "": (selector: string): string => selector, ...variants }).forEach(([variantName, variantFunction]) => {
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
								const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => ((selector === otherSelector) ? "" : `:not(${otherSelector})`)) : [];
								rule.selector = addParent(namedSelector, `${baseSelector}${inactiveThemes.join("")}`);
							});

							container.append(containerFallBack);
						}

						if (mediaQuery) {
							const queryAtRule = postcss.parse(mediaQuery).first as any as AtRule; // eslint-disable-line @typescript-eslint/no-explicit-any

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

							if (queryContainer.nodes) {
								queryAtRule.append(queryContainer.nodes);
							}

							container.append(queryAtRule);
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

			const semantics = allThemes.reduce(
				(semanticsAccumulating, [themeName, themeConfiguration]) => {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					Object.entries(themeConfiguration.semantics!).forEach(([utility, utilityValues]) => {
						if (!Object.prototype.hasOwnProperty.call(semanticsAccumulating, utility)) {
							semanticsAccumulating[utility as ConfigurableSemantics] = {};
						}

						Object.entries(utilityValues).forEach(([valueName, value]) => {
							const thing = semanticsAccumulating[utility as ConfigurableSemantics];
							if (typeof value === "string") {
								if (!Object.prototype.hasOwnProperty.call(thing, valueName)) {
									// Use Maps to guarantee order matches theme order
									thing[valueName] = new Map();
								}
								thing[valueName].set(themeName, value);
							} else {
								// TODO
								console.log({ value });
							}
						});
					});

					return semanticsAccumulating;
				}, {} as Record<ConfigurableSemantics | SupportedSemanticUtilities, Record<string, Map<string, string>>>,
			);

			const behavior = {
				backgroundColor: {
					className: ({ name }: { name: string }) => `bg-${name}`,
				},
				borderColor: {
					className: ({ name }: { name: string }) => `border-${name}`,
				},
				divideColor: {
					className: ({ name }: { name: string }) => `divide-${name}`,
				},
				textColor: {
					className: ({ name }: { name: string }) => `text-${name}`,
				},
			};

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

			const target = lookupConfig("target", "relaxed");
			const ie11 = target === "ie11";

			Object.entries(semantics as Record<SupportedSemanticUtilities, Record<string, Map<string, string>>>).forEach(([utility, utilityConfiguration]) => {
				Object.entries(utilityConfiguration).forEach(([semanticName, sourcePerTheme]) => {
					let utilityEnabled = true;
					if (corePlugins === true) utilityEnabled = true;
					else if (corePlugins === false) utilityEnabled = false;
					else if (Array.isArray(corePlugins)) utilityEnabled = corePlugins.includes(utility);
					else if (corePlugins[utility] === false) utilityEnabled = false;

					if (!utilityEnabled) return;

					const allVariants = lookupVariants(utility, []);
					// Drop theme variants from these utilities because they won't work
					const dedupedVariants = allVariants.filter((variant) => !allThemeNames.includes(variant) && variant !== group);

					const classesToApply = Array.from(sourcePerTheme.entries()).map(([themeName, sourceName]) => `${themeName}${separator}${behavior[utility as SupportedSemanticUtilities].className({ name: sourceName })}`);
					addUtilities({
						[`.${behavior[utility as SupportedSemanticUtilities].className({ name: semanticName })}`]: {
							[`@apply ${classesToApply.join(" ")}`]: "",
							...(!ie11 ? {
								[utility]: `var(--${semanticName})`,
							} : {})
						},
					}, dedupedVariants);
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

export const tailwindcssThemeVariants = thisPlugin;
export default thisPlugin;

export * from "./media-queries";
export * from "./variants";
