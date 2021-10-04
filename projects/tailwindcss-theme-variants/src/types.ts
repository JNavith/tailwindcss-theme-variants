import { WrappedPlugin } from "@navith/tailwindcss-plugin-author-types";

export interface ThisPluginThemeSelectorAndMediaQuery {
	selector: string;
	mediaQuery: string;
}

// https://stackoverflow.com/a/49725198
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
	Pick<T, Exclude<keyof T, Keys>>
	& {
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
	}[Keys]

export type SemanticUtility = {
	themeValueToVariableValue?: (value: any) => string;
	variableValueToThemeValue?: (value: string) => any;
}

export type ObjectOfNestedStrings = {
	[property: string]: string | ObjectOfNestedStrings,
}

export type ThisPluginTheme = RequireAtLeastOne<ThisPluginThemeSelectorAndMediaQuery> & {
	semantics?: ObjectOfNestedStrings;
};

export type Themes = Record<string, ThisPluginTheme>;

export interface ThisPluginOptions {
	themes: Themes;
	baseSelector?: string;
	fallback?: boolean;
	utilities?: Record<string, SemanticUtility>;
}

export type ThisPlugin = (options: ThisPluginOptions) => WrappedPlugin;
