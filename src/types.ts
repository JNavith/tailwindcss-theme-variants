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

export type ThisPluginTheme = RequireAtLeastOne<ThisPluginThemeSelectorAndMediaQuery>;

export interface ThisPluginOptions {
    themes: {
        [name: string]: ThisPluginTheme;
    };
    baseSelector?: string;
    fallback?: string | boolean;
    rename?: (themeName: string) => string;
    variants?: {
        [name: string]: (selector: string) => string;
    };
}

export type ThisPlugin = (options: ThisPluginOptions) => WrappedPlugin;
