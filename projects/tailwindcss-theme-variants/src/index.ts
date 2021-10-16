// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import plugin from "tailwindcss/plugin";

import type { PluginTools, TailwindCSSConfig } from "@navith/tailwindcss-plugin-author-types";
import type {
	ObjectOfNestedStrings, SemanticUtility, ThisPluginOptions, ThisPluginTheme,
} from "./types";
import { addParent } from "./selectors";

const DEFAULT = "DEFAULT";

type FlattenedSemantics = Record<string, Record<string, Map<string, string>>>;
const flattenSemantics = (allThemes: [string, ThisPluginTheme][]): FlattenedSemantics => {
	const semanticsAccumulating = {} as FlattenedSemantics;

	for (const [themeName, themeConfiguration] of allThemes) {
		for (const [utilityName, utilityValues] of Object.entries(themeConfiguration.semantics ?? {})) {
			if (!semanticsAccumulating[utilityName]) {
				semanticsAccumulating[utilityName] = {};
			}

			for (const [rootName, rootValue] of Object.entries(utilityValues ?? {})) {
				const thing = semanticsAccumulating[utilityName];
				const flatten = (name: string, value: string | ObjectOfNestedStrings) => {
					if (typeof value === "string") {
						const computedName = name === DEFAULT ? rootName : `${rootName}-${name}`;
						if (!thing[computedName]) {
							// Use Maps to guarantee order matches theme order
							thing[computedName] = new Map();
						}
						thing[computedName].set(themeName, value);
					} else {
						for (const [nestedName, nestedValue] of Object.entries(value)) {
							const computedName = nestedName === DEFAULT ? name : `${name}-${nestedName}`;
							flatten(computedName, nestedValue);
						}
					}
				};

				if (typeof rootValue === "string") {
					flatten(DEFAULT, rootValue);
				} else {
					for (const [name, value] of Object.entries(rootValue)) {
						flatten(name, value);
					}
				}
			}
		}
	}
	return semanticsAccumulating;
};

const thisPlugin = plugin.withOptions(({
	themes, baseSelector: passedBaseSelector, fallback = false, utilities = {},
}: ThisPluginOptions) => ({
	addBase, addVariant, e, postcss, theme: lookupTheme,
}: PluginTools): void => {
	const allThemes = Object.entries(themes ?? {});
	if (allThemes.length === 0) console.warn("tailwindcss-theme-variants: no themes were given in this plugin's configuration under the `themes` key, so no variants can be generated. this can be fixed by specifying a theme like `light: { selector: '.light' }` in `themes` of this plugin's configuration. see the README for more information");

	const firstTheme = allThemes[0][0];

	// Implicitly disable `baseSelector` on behalf of the person only using media queries to set their themes
	// Otherwise use :root as the default `baseSelector`
	const usesAnySelectors = allThemes.some(([_name, { selector }]) => selector);
	const baseSelector = passedBaseSelector ?? (usesAnySelectors ? ":root" : "");

	if (fallback) {
		if (allThemes.length === 1) {
			if (baseSelector === "") {
				console.warn(`tailwindcss-theme-variants: the "${firstTheme}" theme was selected for fallback, but it is the only one available, so it will always be active, which is unusual. this can be "fixed" by adding another theme to \`themes\` in this plugin's configuration, disabling \`fallback\` in this plugin's configuration, or setting a \`baseSelector\` in this plugin's configuration (there is no way to silence this warning)`);
			} else {
				console.warn(`tailwindcss-theme-variants: the "${firstTheme}" theme was selected for fallback, but it is the only one available, so it will always be active as long as \`${baseSelector}\` exists. this is an unusual pattern, so if you meant not to do this, it can be "fixed" by adding another theme to \`themes\` in this plugin's configuration, disabling \`fallback\` in this plugin's configuration, or changing \`baseSelector\` to \`""\` and setting this theme's \`selector\` to the current value of \`baseSelector\` (there is no way to silence this warning)`);
			}
		}

		if (usesAnySelectors && baseSelector === "") {
			console.warn(`tailwindcss-theme-variants: the "${firstTheme}" theme was selected for fallback, but you specified \`baseSelector: ""\` even though you use theme(s) that need a selector to activate, which will result in confusing and erroneous behavior of when themes activate. this can be fixed by disabling \`fallback\` in this plugin's configuration, or setting a \`baseSelector\` in this plugin's configuration (there is no way to silence this warning)`);
		}
	}

	// Begin variants logic
	for (const [themeName, { mediaQuery, selector }] of allThemes) {
		addVariant(themeName, ({ container, separator }) => {
			const originalContainer = container.clone();
			// Remove the pre-existing (provided by Tailwind's core) CSS so that we don't duplicate it
			container.removeAll();

			const nameSelector = (ruleSelector: string): string => `${(`.${e(`${themeName}${separator}`)}${ruleSelector.slice(1)}`)}`;

			if (fallback && themeName === firstTheme) {
				const containerFallBack = originalContainer.clone();

				containerFallBack.walkRules((rule) => {
					const namedSelector = nameSelector(rule.selector);
					rule.selector = addParent(namedSelector, baseSelector);
				});

				container.append(containerFallBack);
			} else {
				if (mediaQuery) {
					const queryAtRule = postcss.parse(mediaQuery).first;

					// Nest the utilities inside the given media query
					const queryContainer = originalContainer.clone();
					queryContainer.walkRules((rule) => {
						const namedSelector = nameSelector(rule.selector);
						if (fallback && baseSelector !== "") {
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
					const normalContainer = originalContainer.clone();
					normalContainer.walkRules((rule) => {
						const namedSelector = nameSelector(rule.selector);
						const activator = `${baseSelector}${selector}`;
						rule.selector = addParent(namedSelector, activator);
					});

					container.append(normalContainer);
				}
			}
		});
	}
	// End variants logic

	// Begin semantics logic
	const someSemantics = Object.values(themes).some((theme) => theme.semantics);
	const everySemantics = Object.values(themes).every((theme) => theme.semantics);

	if (everySemantics) {
		const semantics = flattenSemantics(allThemes);
		const behavior = utilities;

		for (const [themeName, { mediaQuery, selector }] of allThemes) {
			const fixedBaseSelector = baseSelector || ":root";
			const semanticVariables: Record<string, string> = {};
			for (const [utilityName, utilityConfig] of Object.entries(semantics ?? {})) {
				for (const [variable, valueMap] of Object.entries(utilityConfig ?? {})) {
					if (semanticVariables[variable]) {
						throw new TypeError(`tailwindcss-theme-variants: you duplicated a semantic variable name "${variable}" across your utilities in ${themeName}'s semantics configuration (found in ${utilityName} and at least one other place). this can be fixed by using a different name for one of them`);
					}

					const referenceValue = valueMap.get(themeName);
					if (!referenceValue) {
						throw new TypeError(`tailwindcss-theme-variants: the semantic variable "${variable}" was expected to have an initial ("constant") value for the "${themeName}" theme, but it is undefined. this can be fixed by specifying a value for "${variable}" in any utility's configuration in the "semantics" object under the "${themeName}" theme's configuration`);
					}

					const { themeValueToVariableValue = (x) => x.toString() } = behavior[utilityName] ?? ({} as SemanticUtility);

					const realValue = lookupTheme(`${utilityName}.${referenceValue}`, undefined);
					if (!realValue) throw new TypeError(`tailwindcss-theme-variants: the initial / constant value for the semantic variable named "${variable}" for the "${themeName}" theme couldn't be found; it should be named "${referenceValue}" ${referenceValue.includes(".") || referenceValue.includes("-") ? "(maybe with . in place of -?) " : ""}in \`theme.${utilityName}\`. this can be fixed by making sure the value you referenced (${referenceValue}) is in your Tailwind CSS \`theme\` configuration under \`${utilityName}\`.\nthere could be a mistake here; please create an issue if it actually does exist: https://github.com/JakeNavith/tailwindcss-theme-variants/issues`);

					semanticVariables[`--${variable}`] = themeValueToVariableValue(realValue.toString());
				}
			}

			if (fallback && themeName === firstTheme) {
				addBase({
					[fixedBaseSelector]: semanticVariables,
				});
			} else {
				if (mediaQuery) {
					if (fallback) {
						let selectorWithCustomProperties = fixedBaseSelector;

						if (baseSelector !== "") {
							const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => ((selector === otherSelector) ? "" : `:not(${otherSelector})`)) : [];
							selectorWithCustomProperties = `${fixedBaseSelector}${inactiveThemes.join("")}`;
						}

						addBase({
							[mediaQuery]: {
								[selectorWithCustomProperties]: semanticVariables,
							},
						});
					} else {
						addBase({
							[mediaQuery]: {
								[fixedBaseSelector]: semanticVariables,
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
		}
	} else if (someSemantics) {
		throw new TypeError("tailwindcss-theme-variants: either all themes must define `semantics` or none do. this can be fixed by TODO");
	}
	// End semantics logic
},

({ themes, utilities }: ThisPluginOptions) => {
	const everySemantics = Object.values(themes).every((theme) => theme.semantics);

	const extendedConfig: TailwindCSSConfig & { theme: { extend: NonNullable<TailwindCSSConfig["theme"]> } } = {
		theme: {
			extend: {},
		},
	};

	if (everySemantics) {
		const behavior = { ...utilities };

		const allThemes = Object.entries(themes ?? {});
		const semantics = flattenSemantics(allThemes);

		for (const [configKey, themeMaps] of Object.entries(semantics)) {
			extendedConfig.theme.extend[configKey] = {};

			const { variableValueToThemeValue = (x) => x } = behavior[configKey] ?? ({} as SemanticUtility);
			for (const semanticName of Object.keys(themeMaps)) {
				const variableValueToThemeValued = variableValueToThemeValue(`var(--${semanticName})`);
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error it's typed wrong
				extendedConfig.theme.extend[configKey][semanticName] = variableValueToThemeValued;
			}
		}
	}

	return extendedConfig;
});

export const themeVariants = thisPlugin;

export * from "./media-queries";
export * from "./supports";
