# ⚙️ Full configuration

This plugin expects configuration of the form

```ts
{
    group?: string,
    
    themes: {
        [name: string]: {
            // At least one is required
            selector?: string,
            mediaQuery?: string,
        },
    },

    baseSelector?: string,
    fallback?: boolean | "compact",

    variants?: {
        [name: string]: (selector: string) => string,
    },
}
```

Where each parameter means:

- `group` (defaults to not making a group name): the name of the group of themes in this configuration. For example, a sensible name for `light` and `dark` would be `themes` or `modes`. This will create a `themes` (or `modes`) variant that can be listed in `variants` to generate all the CSS for both `light` and `dark` themes in the correct order (matching your configuration). If you want to stack variants (explained in the `variants` description below), like `focus`, then similarly named variants like `themes:focus` will be created.

- `themes`: an object mapping a theme name to the conditions that determine whether or not the theme will be active.

   - `selector`: a selector that has to be active on `baseSelector` for this theme to be active. For instance, if `baseSelector` is `html`, and `themes.light`'s `selector` is `.light-theme`, then the `light` theme's variant(s) will be in effect whenever `html` has the `light-theme` class on it.

   - `mediaQuery`: a media query that has to be active for this theme to be active. For instance, if the `reduced-motion` theme has `mediaQuery` `"@media (prefers-reduced-motion: reduce)"` (importable as `prefersReducedMotion`), then the `reduced-motion` variant(s) will be active whenever that media query matches: if the visitor's browser reports preferring reduced motion.

- `baseSelector` (default `""` (empty string) if you **only** use media queries to activate your themes, otherwise `":root"`): the selector that each theme's `selector` will be applied to to determine the active theme.

- `fallback` (default `false`): when none of the given media queries or selectors are active, then the first theme you listed in `themes` will activate. You can think of it as the *default* theme for your site.

  If you pass `fallback: "compact"`, then your CSS file size will be drastically reduced for free because redundant things will be "canceled out." You are **recommended** to try this feature and only switch back to `true` if you encounter issues (which you should please [report 😁](https://github.com/JakeNavith/tailwindcss-theme-variants/issues)), because it will become the default option in the future.

- `variants` (default is `{}`): an object mapping the name of a variant to a function that gives a selector for when that variant is active. These will be **merged** with [the default variants](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/src/variants.ts) rather than replace them—this means it works like Tailwind's `extend` feature.

  For example, the default `even` variant takes a `selector` and returns `` `${selector}:nth-child(even)` ``. The default `group-hover` variant returns `` `.group:hover ${selector}` ``

  Each given name and function pair will create an appropriately named variant in combination with each theme for use in the `variants` section of your Tailwind CSS config, like `amoled:my-hover` if you have an `amoled` theme and a `my-hover` variant in this plugin's configuration. Either way, because `hover` is one of the default variants, `amoled:hover` will be created too.
