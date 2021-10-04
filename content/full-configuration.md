# ⚙️ Full configuration

This plugin expects configuration of the form

```ts
{
    themes: {
        [name: string]: {
            // At least one is required
            selector?: string,
            mediaQuery?: string,
        },
    },

    baseSelector?: string,
    fallback?: boolean,
}
```

Where each parameter means:

- `themes`: an object mapping a theme name to the conditions that determine whether or not the theme will be active.

   - `selector`: this theme will be active when this selector is on `baseSelector`. For instance, if `baseSelector` is `html`, and the `light` theme's `selector` is `.light-theme`, then the `light` theme variants will be in effect whenever `html` has the `light-theme` class on it.

   - `mediaQuery`: this theme will be active when this media query is active. For instance, if the `reduced-motion` theme has `mediaQuery` `"@media (prefers-reduced-motion: reduce)"` (importable as `prefersReducedMotion`), then the `reduced-motion` theme variants will be active whenever that media query matches: if the visitor's browser reports preferring reduced motion.

- `baseSelector` (default `""` (empty string) if you **only** use media queries to activate your themes, otherwise `":root"`): the selector that each theme's `selector` will be applied to to determine the active theme.

- `fallback` (default `false`): when none of the given media queries or selectors are active, then the first theme you listed in `themes` will activate. You can think of it as the *default* theme for your site.
