This Tailwind CSS plugin registers variants for theming without needing custom properties. It has support for responsive variants, extra stacked variants, media queries, and falling back to a particular theme when none matches.

## Installation

```sh
npm install --save-dev tailwindcss-theme-variants
```

## Basic usage

### Using selectors to choose the active theme

With this Tailwind configuration,

```js
const { default: tailwindcssThemeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        backgroundColor: {
            "gray-900": "#1A202C",
        },
    },

    variants: {
        backgroundColor: ["light", "dark"],
    },

    plugins: [
        tailwindcssThemeVariants({
            themes: {
                light: {
                    selector: ".light-theme",
                },
                dark: {
                    selector: ".dark-theme",
                },
            },
        }),
    ],
};
```

this CSS is generated:

```css
.bg-gray-900 {
    background-color: #1A202C;
}

:root.light-theme .light\:bg-gray-900 {
    background-color: #1A202C;
}

:root.dark-theme .dark\:bg-gray-900 {
    background-color: #1A202C;
}
```

💡 You can choose more than just classes for your selectors. Other, good options include data attributes, like `[data-padding=compact]`. You *can* go as crazy as `.class[data-theme=light]:dir(rtl)`, for example, but at that point you need to be careful with specificity!

### Using media queries to choose the active theme

You may rather choose to tie your theme selection to matched media queries, like [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme):

```js
const { default: tailwindcssThemeVariants, prefersLight, prefersDark } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        backgroundColor: {
            "teal-500": "#38B2AC",
        },
    },

    variants: {
        backgroundColor: ["light", "dark"],
    },

    plugins: [
        tailwindcssThemeVariants({
            themes: {
                light: {
                    mediaQuery: prefersLight /* "@media (prefers-color-scheme: light)" */,
                },
                dark: {
                    mediaQuery: prefersDark /* "@media (prefers-color-scheme: dark)" */,
                },
            },
        }),
    ],
};
```

Which generates this CSS:

```css
.bg-teal-500 {
    background-color: #38B2AC
}

@media (prefers-color-scheme: light) {
    .light\:bg-teal-500 {
        background-color: #38B2AC;
    }
}

@media (prefers-color-scheme: dark) {
    .dark\:bg-teal-500 {
        background-color: #38B2AC;
    }
}
```

💡 Keep the `variants` listed in the same order as in `themes` in this plugin's configuration for consistency and the most expected behavior. As you see above, `light` came first, then `dark` in `backgroundColor`'s `variants`, so we also list `light` before `dark` in `tailwindcssThemeVariants`'s `themes` option.


## Full configuration

This plugin expects configuration of the form

```ts
interface ThisPluginOptions {
    themes: {
        [name: string]: {
            // At least one is required
            selector?: string;
            mediaQuery?: string;
        }
    };

    baseSelector?: string;
    fallback?: string | boolean;
    rename?: (themeName: string) => string;

    variants?: {
        // The name of the variant -> what has to be done to the selector for the variant to be active
        [name: string]: (selector: string) => string;
    };
}
```

Where each parameter means:

- `themes`: an object mapping a theme name to the conditions that determine whether or not the theme will be active.

   - `selector`: a selector that has to be active on `baseSelector` for this theme to be active. For instance, if `baseSelector` is `html`, and `themes.light`'s `selector` is `.light-theme`, then the `light` theme's variant(s) will be in effect whenever `html` has the `light-theme` class on it.

   - `mediaQuery`: a media query that has to be active for this theme to be active. For instance, if the `reduced-motion` theme has `mediaQuery` `"@media (prefers-reduced-motion: reduce)"` (importable as `prefersReducedMotion`), then the `reduced-motion` variant(s) will be active.


- `baseSelector` (default `":root"`): the selector that each theme's `selector` will be applied to to determine the active theme.
    

- `fallback` (default `false`): chooses a theme to fall back to when none of the media queries or selectors are active. You can either manually select a theme by giving a string like `"solarized-dark"` or implicitly select the first one listed in `themes` by giving `true`.


- `rename` (default is a function that gives back exactly what was passed, as in `rename("red") === "red"`, i.e. no renaming actually takes place): a function for renaming every theme, which changes the name of the generated variants. 

  The most usual way to use this is to add a prefix or suffix to reduce duplication. For example, you can ``rename: (themeName) => `${themeName}-theme` `` to make `themes: { red, green, blue }` have corresponding variants `red-theme`, `green-theme`, and `blue-theme`. This also means that their generated class names are like `red-theme\:bg-green-300` instead of just `red\:bg-green-300`.

- `variants` (default is nothing): an object mapping the name of extra variants to a function that explains what has to be done to the selector for it to be active. 

  For example, the importable `even` variant takes a `selector` and returns `` `${selector}:nth-child(even)` ``. The importable `groupHover` (which you are recommended to name `"group-hover"` for consistency) variant returns `` `.group:hover ${selector}` ``

## Examples
💡 At the time of writing, this documentation is a work in progress. For all examples, where I've done my best to stretch the plugin to its limits (especially towards the end of the file), see the test suite in [`tests/index.ts`](https://github.com/SirNavith/tailwindcss-theme-variants/blob/master/tests/index.ts#L46).

### Fallback
TODO

### Stacked variants

💡 All of Tailwind CSS's core variants are bundled for use with the plugin. You can see the full list in [`src/variants.ts`](https://github.com/SirNavith/tailwindcss-theme-variants/blob/master/src/variants.ts).

TODO

```js
TODO
```

### 

### Using both selectors and media queries
TODO

TODO: Show active theme tables for every example

## License and Contributing

MIT licensed. There are no contributing guidelines. Just do whatever you want to point out an issue or feature request and I'll work with it.

## Alternatives
TODO: theming plugin comparison table

<table>
    <thead>
        <tr>
            <th></th>
            <th><a href="https://tailwindcss.com/docs/breakpoints/#dark-mode">Native screens</a></th>
            <th><a href="https://github.com/ChanceArthur/tailwindcss-dark-mode">tailwindcss-dark-mode</a></th>
            <th><a href="https://github.com/danestves/tailwindcss-darkmode">tailwindcss-darkmode</a></th>
            <th><a href="https://github.com/javifm86/tailwindcss-prefers-dark-mode">tailwindcss-prefers-dark-mode</a></th>
            <th><a href="https://github.com/crswll/tailwindcss-theme-swapper">tailwindcss-theme-swapper</a></th>
            <th><a href="https://github.com/SirNavith/tailwindcss-theme-variants">tailwindcss-theme-variants</a></th>
            <th><a href="https://github.com/innocenzi/tailwindcss-theming">tailwindcss-theming</a></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Controllable with selectors (classes or data attributes)</th>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Responsive</th>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td></td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Requires <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*">custom properties</a></th>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Supports <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme"><code>prefers-color-scheme: dark</code></a></th>
            <td>✅</td>
            <td>With JavaScript</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td></td>
        </tr>
        <tr>
            <th>Supports <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme"><code>prefers-color-scheme: light</code></a></th>
            <td>✅</td>
            <td>With JavaScript</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td></td>
        </tr>
        <tr>
            <th>Other thing</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>


---

*Repository preview image generated with [GitHub Social Preview](https://social-preview.pqt.dev/)*
