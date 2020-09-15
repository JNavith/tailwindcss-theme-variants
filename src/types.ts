import { WrappedPlugin } from "@navith/tailwindcss-plugin-author-types";

import * as builtinUtilities from "./utilities";

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
	className: ({ name }: { name: string }) => string;
	opacityUtility?: string;
	opacityVariable?: string;
	property?: string;
	selector?: ({ name }: { name: string }) => string;
}

export type SupportedSemanticUtilities = keyof typeof builtinUtilities;
export type SpecialSemantickeys = "colors";
export type ConfigurableSemantics = SupportedSemanticUtilities | SpecialSemantickeys;

export type ThisPluginTheme = RequireAtLeastOne<ThisPluginThemeSelectorAndMediaQuery> & {
	semantics?: {
		[utility in ConfigurableSemantics]?: {
			[name: string]: string | { [valueName: string]: string };
		}
	}
};

export type Themes = { [name: string]: ThisPluginTheme };

export interface ThisPluginOptions<GivenThemes extends Themes, GroupName extends string> {
	group?: GroupName extends (keyof GivenThemes) ? never : GroupName;
	themes: GivenThemes;
	baseSelector?: string;
	fallback?: boolean | "compact";
	variants?: {
		[name: string]: (selector: string) => string;
	};
}

export type ThisPlugin<GivenThemes extends Themes, GroupName extends string> = (options: ThisPluginOptions<GivenThemes, GroupName>) => WrappedPlugin;
