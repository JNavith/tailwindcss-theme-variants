import { AtRule } from "postcss";
import plugin from "tailwindcss/plugin";

import { ThisPlugin, ThisPluginOptions, PluginTools } from "./types";
import { addParent } from "./selectors";

const nameVariant = (renamedTheme: string, variantName: string): string => {
	if (variantName === "") {
		return renamedTheme;
	}
	return `${renamedTheme}:${variantName}`;
};

const thisPlugin: ThisPlugin = plugin.withOptions(({
	themes, baseSelector, fallback = false, rename = (themeName: string): string => themeName, variants = {},
}: ThisPluginOptions) => ({
	addVariant, e, postcss,
}: PluginTools): void => {
	const allThemes = Object.entries(themes);
	if (allThemes.length === 0) {
		console.warn("tailwindcss-theme-variants: no themes were given in this plugin's configuration under the `themes` key, so no variants can be generated");
	}

	if (fallback === true) {
		fallback = allThemes[0][0]; // eslint-disable-line prefer-destructuring,no-param-reassign
	}

	if (fallback && allThemes.length === 1) {
		if (baseSelector === "") {
			console.warn(`tailwindcss-theme-variants: the \`${fallback}\` theme was selected for fallback, but it is the only one available, so it will always be active, which is unusual. this can be "fixed" by adding another theme to \`themes\` in this plugin's configuration, disabling \`fallback\` in this plugin's configuration, or setting a \`baseSelector\` in this plugin's configuration (there is no way to silence this warning)`);
		} else {
			console.warn(`tailwindcss-theme-variants: the \`${fallback}\` theme was selected for fallback, but it is the only one available, so it will always be active as long as \`${baseSelector}\` exists. this is an unusual pattern, so if you meant not to do this, it can be "fixed" by adding another theme to \`themes\` in this plugin's configuration, disabling \`fallback\` in this plugin's configuration, or changing \`baseSelector\` to \`""\` and setting this theme's \`selector\` to the current value of \`baseSelector\` (there is no way to silence this warning)`);
		}
	}

	if (baseSelector === undefined) {
		// Implicitly disable `baseSelector` on behalf of the person only using media queries to set their themes
		// Otherwise use :root as the default `baseSelector`
		// eslint-disable-next-line no-param-reassign
		baseSelector = allThemes.some(([_name, { selector }]) => selector) ? ":root" : "";
	}

	// Use a normal default variant first
	Object.entries({ "": (selector: string): string => selector, ...variants }).forEach(([variantName, variantFunction]) => {
		allThemes.forEach(([themeName, { mediaQuery, selector }]) => {
			const namedVariant = nameVariant(rename(themeName), variantName);

			addVariant(namedVariant, ({ container, separator }) => {
				const nameSelector = (ruleSelector: string): string => `${variantFunction(`.${e(`${namedVariant.replace(/:/g, separator)}${separator}`)}${ruleSelector.slice(1)}`)}`;

				const originalContainer = container.clone();
				// Remove the pre-existing (provided by Tailwind's core) CSS so that we don't duplicate it
				container.removeAll();

				if (themeName === fallback) {
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
						if (fallback && baseSelector !== "") {
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

export const tailwindcssThemeVariants = thisPlugin;
export default thisPlugin;

export * from "./media-queries";
export * from "./variants";
