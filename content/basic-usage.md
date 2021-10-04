# 🛠 Basic usage

## Using selectors to choose the active theme

With this Tailwind configuration,

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        backgroundColor: {
            "gray-900": "#1A202C",
        },
    },

    plugins: [
        themeVariants({
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
    background-color: #1A202C
}

/* If you're having trouble understanding,
   imagine it said html instead of :root,
   like in the example HTML below */

:root.light-theme .light\:bg-gray-900 {
    background-color: #1A202C
}

:root.dark-theme .dark\:bg-gray-900 {
    background-color: #1A202C
}
```

We can implement a simple themed button in HTML like this:

```html
<html class="light-theme"> <!-- Change to dark-theme -->
    <button class="light:bg-teal-200   dark:bg-teal-800 
                   light:text-teal-700 dark:text-teal-100">
        
        Sign up
    </button>
</html>
```

This will result in dark blue text on a light blue background in the light theme, and light blue text on a dark blue background in the dark theme.

💡 You can choose more than just classes for your selectors. Other, good options include data attributes, like `[data-padding=compact]`. You *can* go as crazy as `.class[data-theme=light]:dir(rtl)`, for example, but I think that's a bad idea!


## Using media queries to choose the active theme

You may rather choose to tie your theme selection to matched media queries, like [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme):

```js
const { themeVariants, prefersLight, prefersDark } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        backgroundColor: {
            "teal-500": "#38B2AC",
        },
    },

    plugins: [
        themeVariants({
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
        background-color: #38B2AC
    }
}

@media (prefers-color-scheme: dark) {
    .dark\:bg-teal-500 {
        background-color: #38B2AC
    }
}
```
