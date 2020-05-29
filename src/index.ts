import { AtRule, Container } from "postcss";
import plugin from "tailwindcss/plugin";

import { ThisPlugin, ThisPluginOptions, PluginTools } from "./types";


const nameVariant = (renamedTheme: string, responsive: string, variantName: string): string => {
	if (variantName === "") {
		if (responsive === "") {
			return renamedTheme;
		}
		return `${renamedTheme}:${responsive}`;
	}
	if (responsive === "") {
		return `${renamedTheme}:${variantName}`;
	}
	return `${renamedTheme}:${responsive}:${variantName}`;
};

const thisPlugin: ThisPlugin = plugin.withOptions(({
	themes, baseSelector = ":root", fallback = false, rename = (themeName: string): string => themeName, variants = {},
}: ThisPluginOptions) => ({
	addVariant, e, postcss, theme,
}: PluginTools): void => {
	const allThemes = Object.entries(themes);
	if (allThemes.length === 0) {
		console.warn("tailwindcss-theme-variants: no themes were given in this plugin's configuration under the `themes` key, so no variants can be generated");
	}

	const allScreens: [string, string][] = Object.entries(theme("screens", {}) ?? {});

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

	// Don't even try to add responsive variants if there are no screens, because they won't create any CSS if used
	(allScreens.length === 0 ? [false] : [false, true]).forEach((isResponsive) => {
		// Use a dummy screen to reduce duplicating logic between the responsive and not responsive versions
		const screens: [string, string | undefined][] = isResponsive ? allScreens : [["", undefined]];

		// Similarly, use a dummy default variant first
		Object.entries({ "": (selector: string): string => selector, ...variants }).forEach(([variantName, variantFunction]) => {
			allThemes.forEach(([themeName, { mediaQuery, selector }]) => {
				const nameThisVariant = (responsive: string): string => nameVariant(rename(themeName), responsive, variantName);

				addVariant(nameThisVariant(isResponsive ? "responsive" : ""), ({ container, separator }) => {
					const nameSelector = (namedVariant: string, ruleSelector: string): string => `${variantFunction(`.${e(`${namedVariant.replace(/:/g, separator)}${separator}`)}${ruleSelector.slice(1)}`)}`;

					const originalContainer = container.clone();
					// Remove the pre-existing (provided by Tailwind's core) CSS so that we don't duplicate it
					container.removeAll();

					screens.forEach(([screen, minWidth]) => {
						// Tool to nest the utilities inside the screen media query if it exists
						const nestIfNecessaryAndAdd = (source: Container, destination: Container): void => {
							if (minWidth) {
								const screenAtRule = postcss.atRule({ name: "media", params: `(min-width: ${minWidth})` });
								screenAtRule.append(source);
								destination.append(screenAtRule);
							} else {
								destination.append(source);
							}
						};


						if (themeName === fallback) {
							const containerFallBack = originalContainer.clone();

							containerFallBack.walkRules((rule) => {
								const namedSelector = nameSelector(nameThisVariant(""), rule.selector);
								const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => `:not(${otherSelector})`) : [];
								rule.selector = `${baseSelector}${inactiveThemes.join("")} ${namedSelector}`;
							});

							nestIfNecessaryAndAdd(containerFallBack, container);
						}

						if (mediaQuery) {
							const queryAtRule = postcss.parse(mediaQuery).first as any as AtRule; // eslint-disable-line @typescript-eslint/no-explicit-any

							// Nest the utilities inside the given media query
							const queryContainer = originalContainer.clone();
							queryContainer.walkRules((rule) => {
								const namedSelector = nameSelector(nameThisVariant(screen), rule.selector);
								// Make sure specifity is high enough for media-query-backed themes to overcome their fallbackconst namedSelector = nameSelector(e, nameThisVariant(""), separator, rule.selector, variantFunction);
								if (fallback && baseSelector !== "") {
									const inactiveThemes = selector ? allThemes.map(([_themeName, { selector: otherSelector }]) => `:not(${otherSelector})`) : [];
									rule.selector = `${baseSelector}${inactiveThemes.join("")} ${namedSelector}`;
								} else {
									rule.selector = namedSelector;
								}
							});

							if (queryContainer.nodes) {
								queryAtRule.append(queryContainer.nodes);
							}

							nestIfNecessaryAndAdd(queryAtRule, container);
						}

						if (selector) {
							const normalScreenContainer = originalContainer.clone();
							normalScreenContainer.walkRules((rule) => {
								const namedSelector = nameSelector(nameThisVariant(screen), rule.selector);
								const activator = `${baseSelector}${selector}`;
								rule.selector = `${activator} ${namedSelector}`;
							});

							// Nest the utilities inside the screen media query if it exists
							nestIfNecessaryAndAdd(normalScreenContainer, container);
						}
					});
				});
			});
		});
	});
});

export default thisPlugin;

export {
	active, disabled, even, first, focus, focusWithin, hover, last, odd, visited,
	groupActive, groupFocus, groupFocusWithin, groupHover,
} from "./variants";

export {
	prefersAnyScheme, prefersDark, prefersLight,
	prefersAnyMotion, prefersReducedMotion,
	prefersAnyTransparency, prefersReducedTransparency,
	prefersAnyContrast, prefersHighContrast, prefersLowContrast,
} from "./media-queries";
