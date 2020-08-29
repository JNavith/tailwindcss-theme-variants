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

export type SupportedSemanticUtilities = "colors";
export type ThisPluginTheme = RequireAtLeastOne<ThisPluginThemeSelectorAndMediaQuery> & {
	semantics?: {
		[utility in SupportedSemanticUtilities]: {
			[name: string]: string;
		}
	}
};

export type Themes = { [name: string]: ThisPluginTheme };

export interface ThisPluginOptions<GivenThemes extends Themes, GroupName extends string> {
	group?: GroupName extends (keyof GivenThemes) ? never : GroupName;
	themes: GivenThemes;
	baseSelector?: string;
	fallback?: boolean;
	variants?: {
		[name: string]: (selector: string) => string;
	};
}

export type ThisPlugin<GivenThemes extends Themes, GroupName extends string> = (options: ThisPluginOptions<GivenThemes, GroupName>) => WrappedPlugin;
