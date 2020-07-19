import {
	AcceptedPlugin, AtRule, AtRuleNewProps, CommentNewProps, Container, Declaration, DeclarationNewProps, Parser, PluginInitializer, Processor, Stringifier, Root, Rule, RuleNewProps,
} from "postcss";

export type ThemeValue = string | string[] | number | { [key: string]: ThemeValue } | undefined;

export interface Theme {
	[key: string]: {
		[value: string]: NonNullable<ThemeValue>;
	};
}

export type CorePluginsArray = string[];

export interface CorePluginsObject {
	[k: string]: boolean;
}

export type CorePlugins = boolean | CorePluginsArray | CorePluginsObject;

export interface NestedObject {
	[k: string]: string | NestedObject;
}

export interface AddComponentsOptionsObject {
	respectPrefix?: boolean;
	variants?: VariantsValue;
}

export type AddComponentsOptions = AddComponentsOptionsObject | VariantsValue;

export type VariantsValue = VariantsObject[keyof VariantsObject];

export interface AddUtilitiesOptionsObject {
	respectPrefix?: boolean;
	respectImportant?: boolean;
	variants?: VariantsValue;
}

export type AddUtilitiesOptions = AddUtilitiesOptionsObject | VariantsValue;

export interface ModifySelectorsOptions {
	className: string;
}

export interface AddVariantGeneratorOptions {
	container: Container;
	modifySelectors: (modifierFunction: (options: ModifySelectorsOptions) => string) => void;
	separator: string;
}

export type AddVariantGenerator = (options: AddVariantGeneratorOptions) => void;

export type ConfigValue = Theme | ThemeValue | CorePlugins | Plugin[] | undefined;

export interface PostCSS {
	(plugins?: AcceptedPlugin[] | undefined): Processor;
	plugin<T>(name: string, initializer: PluginInitializer<T>): Plugin<T>;
	stringify: Stringifier;
	parse: Parser;
	comment(defaults?: CommentNewProps): Comment;
	atRule(defaults?: AtRuleNewProps): AtRule;
	decl(defaults?: DeclarationNewProps): Declaration;
	rule(defaults?: RuleNewProps): Rule;
	root(defaults?: any): Root; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type PluginTools = {
	addBase: (baseStyles: NestedObject) => void;
	addComponents: (components: NestedObject, options: AddComponentsOptions) => void;
	addUtilities: (utilities: NestedObject, options: AddUtilitiesOptions) => void;
	addVariant: (name: string, generator: AddVariantGenerator) => void;
	config: (path: string, defaultValue: ConfigValue) => ConfigValue;
	e: (className: string) => string;
	postcss: PostCSS;
	prefix: (selector: string) => string;
	theme: <Default extends ThemeValue>(path: string, defaultValue: Default) => ThemeValue | Default;
	variants: <Default>(path: string, defaultValue: Default) => (VariantsObject[keyof VariantsObject]) | Default;
}

export type BasicPlugin = (args: PluginTools) => void;

export interface WrappedPlugin {
	handler: BasicPlugin;
	config: TailwindCSSConfig;
}

export type PluginFunction<Options> = (options: Options) => BasicPlugin;
export type ConfigFunction<Options> = (options: Options) => TailwindCSSConfig;
export type PluginWithOptions<Options> = (pluginFunction: PluginFunction<Options>, configFunction?: ConfigFunction<Options>) => BasicPlugin;
export type Plugin<Options = null> = Options extends null ? (BasicPlugin | WrappedPlugin) : PluginWithOptions<Options>;

export interface CreatePlugin {
	(plugin: BasicPlugin, config?: TailwindCSSConfig): WrappedPlugin;
	withOptions<Options>(pluginFunction: PluginFunction<Options>, configFunction?: ConfigFunction<Options>): (options: Options) => WrappedPlugin;
}

export interface VariantsObject {
	[utility: string]: string[];
}

export interface TailwindCSSConfig {
	separator?: string;
	theme?: Theme;
	corePlugins?: CorePlugins;
	plugins?: Plugin[];
	variants?: VariantsObject;
}

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

export type ThisPluginTheme = RequireAtLeastOne<ThisPluginThemeSelectorAndMediaQuery, "selector" | "mediaQuery">;

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
