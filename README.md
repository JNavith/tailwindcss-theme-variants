This Tailwind CSS plugin TODO. Registers variants. For theming. Without custom properties. With support for stacking variants. With support for media queries. With optional fallback.

TODO: effective theme table for every example.

Because this documentation is in progress, you are recommended to just look at the test suite in `tests/index.ts` to see just what this plugin can do!

## Installation

```sh
npm install --save-dev tailwindcss-theme-variants
```

## Basic usage

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
                    "selector": ".light-theme",
                },
                dark: {
                    "selector": ".dark-theme",
                },
            },
        }),
    ],
};
```

this CSS is generated:

```css
TODO
```


### Media queries
TODO

```js
TODO
```


### Stacked variants

TODO

```js
TODO
```


## Advanced usage

This plugin expects configuration of the form

```js
TODO
```

Where each parameter means:

- TODO


## Examples

TODO

💡 Smart ideas will be here!

## License and Contributing

MIT licensed. There are no contributing guidelines. Just do whatever you want to point out an issue or feature request and I'll work with it.
