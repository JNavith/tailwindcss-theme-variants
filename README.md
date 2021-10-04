# 🌗 Tailwind CSS Theme Variants


**This Tailwind CSS plugin registers variants for theming beyond just light and dark modes *without needing custom properties***. It has support for 
* Controlling themes with 
  * **Media queries**, like [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), `print`, or anything you want
  * **CSS selectors**, like classes and data attributes
  * Or both at the same time!
* **Responsive** variants
* **Stacking** on extra **variants**, like `hover` so you can change a link's hover color depending on the theme
* **Falling back** to a certain theme when no other one could become active, like if a visitor's browser doesn't support JavaScript or the new `prefers-` media queries
* **As many themes as you want**: light theme, dark theme, red theme, blue theme—just bring your own definitions! The experimental `semantics` feature makes multiple themes easy to deal with!

You are recommended to check out [the comparison table of all Tailwind CSS theming plugins below](#alternatives) before committing to any one. By the way, you might have noticed this plugin's documentation / `README` is *very* long—don't let that frighten you! I designed it to be *overdocumented* and as exhaustive as possible, and since most of it is long code snippets, it's shorter than it looks *and* you don't need to go through it all to do well!


# ⬇️ Installation

```sh
npm install --save-dev tailwindcss-theme-variants
```


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


# Examples
💡 If you want to see the plugin get stretched to its limits, see the test suite in [`the tests directory`](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/tests).

## Fallback
### Media queries
With the same media-query-activated themes as [above](#using-media-queries-to-choose-the-active-theme),
```js
themes: {
    light: {
        mediaQuery: prefersLight /* "@media (prefers-color-scheme: light)" */,
    },
    dark: {
        mediaQuery: prefersDark /* "@media (prefers-color-scheme: dark)" */,
    },
},
```
we can create a table to show what the active theme will be under all possible conditions:

<table>
<thead>
<tr align="center">
<th align="left">Matching media query</th>
<th>Neither</th>
<th><code>prefers-color-scheme: light</code></th>
<th><code>prefers-color-scheme: dark</code></th>
</tr>
</thead>

<tbody>
<tr align="center">
<th align="left">Active theme</th>
<td>None</td>
<td><code>light</code></td>
<td><code>dark</code></td>
</tr>
</tbody>
</table>

**The whole point of the fallback feature is to address that *None* case.** It could mean that the visitor is using a browser that doesn't [support `prefers-color-scheme`](https://caniuse.com/#search=prefers-color-scheme), such as IE11. Instead of leaving them on an unthemed site, we can "push" them into a particular theme by specifying `fallback`.

```js
themes: {
    light: {
        mediaQuery: prefersLight /* "@media (prefers-color-scheme: light)" */,
    },
    dark: {
        mediaQuery: prefersDark /* "@media (prefers-color-scheme: dark)" */,
    },
},
// New addition
fallback: true,
// Because `light` is the first theme in the list, that is what will be fallen back to
```

Which will change the generated CSS to activate `light` earlier than any media queries—since those are later in the file, they could still take precedent over this fallback case. **You could think of `light` as the *default theme*** in this case.
```css
.bg-teal-500 {
    background-color: #38B2AC
}

/* Different! */
.light\:bg-teal-500 {
    background-color: #38B2AC
}

@media (prefers-color-scheme: dark) {
    .dark\:bg-teal-500 {
        background-color: #38B2AC
    }
}
```

Which, in turn, changes the active theme table to:
<table>
<thead>
<tr align="center">
<th align="left">Matching media query</th>
<th>Neither</th>
<th><code>prefers-color-scheme: light</code></th>
<th><code>prefers-color-scheme: dark</code></th>
</tr>
</thead>

<tbody>
<tr align="center">
<th align="left">Active theme</th>
<td><code>light</code></td>
<td><code>light</code></td>
<td><code>dark</code></td>
</tr>
</tbody>
</table>

💡 Even though `background-color` has been used in every example so far, theme variants are available for *any* utility. 

### Selectors
`fallback` also works for selector-activated themes.

💡 If you control themes on your site by adding / removing classes or attributes on the `html` or `body` element with JavaScript, then visitors without JavaScript enabled would see the `fallback` theme!

```js
themes: {
    dark: {
        selector: ".dark-theme",
    },
    light: {
        selector: ".light-theme",
    },
},
fallback: true, // Fall back to `dark`
```

**Fallback always chooses the first theme in your list of themes.** To choose a different theme, change the order of `themes`.

These options, with the same Tailwind config as before with `backgroundColor: ["dark", "light"]` (because that matches the order in `themes`) in `variants`, will generate:
```css
.bg-gray-900 {
    background-color: #1A202C;
}

:root .dark\:bg-gray-900 {
    background-color: #1A202C;
}

:root.light-theme .light\:bg-gray-900 {
    background-color: #1A202C;
}
```

Which has the active theme table:
<table>
<thead>
<tr>
<th align="left">Matching selector</th>
<th align="left">Active theme</th>
</tr>
</thead>

<tbody>
<tr>
<th align="left">Neither</th>
<td align="center"><code>dark</code></td>
</tr>

<tr>
<th align="left"><code>:root.light-theme</code></th>
<td align="center"><code>light</code></td>
</tr>

<tr>
<th align="left"><code>:root.dark-theme</code></th>
<td align="center"><code>dark</code></td>
</tr>
</tbody>
</table>


## Stacked variants
You can "stack" built-in or custom variants on top of the existing theme variants. We call it *stacking* because multiple variants are required: like in `night:focus:border-white`, the border will only be white if the `night` theme is active **and** the element is `:focus`ed on.

Here's an example of combining [`prefers-contrast: high`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) with the `:hover` variant:
```js
const { themeVariants, prefersHighContrast } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },
    plugins: [
        themeVariants({
            themes: {
                "high-contrast": {
                    mediaQuery: prefersHighContrast /* "@media (prefers-contrast: high)" */,
                },
            },
        }),
    ],
};
```

You could create a simple card that uses contrast pleasant for fully sighted visitors, or functional high contrast for those who specify it:
```html
<div class="bg-gray-100   high-contrast:bg-white
            text-gray-800 high-contrast:text-black">
    
    <h1>Let me tell you all about...</h1>
    <h2>... this great idea I have!</h2>

    <a href="text-blue-500       high-contrast:text-blue-700
             hover:text-blue-600 high-contrast:hover:text-blue-900">

        See more
    </a>
</div>
```

Another—complex—example: suppose you want to zebra stripe your tables, matching the current theme, and change it on hover:

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    plugins: [
        themeVariants({
            baseSelector: "table.themed",
            themes: {
                "no-accent": { selector: "" },
                "green-accent": { selector: ".themed-green" },
                "orange-accent": { selector: ".themed-orange" },
            },
        }),
    ],
};
```

We can then implement the themeable table in HTML (Svelte) like so:

```html
<table class="themed themed-green"> <!-- Try changing themed-green to themed-orange or removing it -->
    {#each people as person}
        <tr class="no-accent:bg-white               green-accent:bg-green-50             orange-accent:bg-orange-50
                   no-accent:hover:bg-gray-100      green-accent:hover:bg-green-100      orange-accent:hover:bg-orange-100
                   no-accent:odd:bg-gray-100        green-accent:odd:bg-green-100        orange-accent:odd:bg-orange-100
                   no-accent:odd:hover:bg-gray-200  green-accent:odd:hover:bg-green-200  orange-accent:odd:hover:bg-orange-100
                  ">

            <td>{person.firstName} {person.lastName}</td>
            <td>{person.responsibility}</td>
            <!-- ... -->
        </tr>
    {/each}
</table>
```


### Responsive variants
Responsive variants let you distinguish the current breakpoint per theme. For example, `lg:green-theme:border-green-200` will have a `green-200` border *only* when the breakpoint is `lg` (or larger) **and** `green-theme` is active.

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },
    
    plugins: [
        themeVariants({
            themes: {
                day: { selector: "[data-time=day]" },
                night: { selector: "[data-time=night]" },
            },
        }),
    ],
};
```

With this, we could make the landing page's title line change color at different screen sizes "within" each theme:
```html
<h1 class="day:text-black          night:text-white
           sm:day:text-orange-800  sm:night:text-yellow-100
           lg:day:text-orange-600  lg:night:text-yellow-300">
    
    The best thing that has ever happened. Ever.
</h1>
```


We could also make a group of themes for data density, like you can [configure in GMail](https://www.solveyourtech.com/switch-compact-view-gmail/):

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    plugins: [
        themeVariants({
            // baseSelector is ":root"
            themes: {
                comfortable: { selector: "[data-density=comfortable]" },
                compact: { selector: "[data-density=compact]" },
            },
            // Fall back to the first theme listed (comfortable) when density is not configured
            fallback: true,
        }),
    ],
};
```

This will allow us to configure the padding for each theme for each breakpoint, of a list of emails in the inbox (so original!):
```html
<li class="comfortable:p-2     compact:p-0
           md:comfortable:p-4  md:compact:p-1
           xl:comfortable:p-6  xl:compact:p-2">
    
    FWD: FWD: The real truth behind...
</li>
```

#### Extra stacked variants
You can still stack extra variants even while using responsive variants, but this is not commonly needed.

Here's an example:
```js
const { themeVariants, landscape, portrait } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    plugins: [
        themeVariants({
            themes: {
                landscape: {
                    mediaQuery: landscape,
                },
                portrait: {
                    mediaQuery: portrait,
                },
            },
            fallback: true,
        }),
    ],
};
```

We can make an `h1` change size based on orientation *and* breakpoint *and* hover for readability (this is definitely a contrived example):

```html
<h1 class="landscape:text-base          portrait:text-xs
           sm:landscape:text-lg         sm:portrait:text-sm
           sm:landscape:hover:text-xl   sm:portrait:hover:text-md
           lg:landscape:text-2xl        lg:portrait:text-lg
           lg:landscape:hover:text-3xl  lg:portrait:hover:text-xl">
    
    This article title will try to change size so that it stays readable... hopefully.
</h1>
```

More realistically, you might just want to change a link color on hover depending on the breakpoint and theme.

## Using both selectors and media queries
⚠️ If you use both selectors and media queries to activate themes, then **make sure that each specified class is specified as an *all or nothing* approach**. For instance, if you have `winter` and `summer` themes and want to add the `winter:bg-teal-100` class, then you also need to add the `summer:bg-orange-200` class. If you don't do this, then it will look like the values from an theme that's *supposed* to be inactive are "leaking" into the active theme.

**Every feature previously discussed will still work as you'd expect**, even when you decide to also add selectors or media queries to theme control. When both selectors and media queries are in use, **selectors will always take priority over media queries**. This allows the flexibility of *defaulting* to media queries and *overriding* with JavaScript!

For example, see this plugin call:
```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    themeVariants({
        themes: {
            cyan: {
                selector: ".day",
                mediaQuery: prefersLight,
            },
            navy: {
                selector: ".night",
                mediaQuery: prefersDark,
            },
        },
    }),
],
```

It has the corresponding active theme table:
<table>
<thead>
<tr>
<th align="left">Match</th>
<th align="left">Neither</th>
<th align="left"><code>prefers-color-scheme: light</code></th>
<th align="left"><code>prefers-color-scheme: dark</code></th>
</tr>
</thead>

<tbody>
<tr>
<th align="left">Neither</th>
<td align="center">None</td>
<td align="center"><code>cyan</code></td>
<td align="center"><code>navy</code></td>
</tr>

<tr>
<th align="left"><code>:root.day</code></th>
<td align="center"><code>cyan</code></td>
<td align="center"><code>cyan</code></td>
<td align="center"><code>cyan</code></td>
</tr>

<tr>
<th align="left"><code>:root.night</code></th>
<td align="center"><code>navy</code></td>
<td align="center"><code>navy</code></td>
<td align="center"><code>navy</code></td>
</tr>
</tbody>
</table>

As previously noted, when a required selector is present, it takes precendence over the media queries. Stated another way, the media queries only matter when no selector matches.

⚠️ If you are stacking variants on while using both selectors and media queries to activate themes, then **make sure that each stacked variant is specified as an *all or nothing* approach** on each element. For instance, if you have `normal-motion` and `reduced-motion` themes and want to add the `reduced-motion:hover:transition-none` class, then you also need to add the `normal-motion:hover:transition` class (or any [value of `transitionProperty`](https://tailwindcss.com/docs/transition-property/)). If you don't do this, then it will look like the values from a theme that's *supposed* to be inactive are "leaking" into the active theme.

### Fallback
Like when just selectors or just media queries are used for theme selection, the fallback feature for both media queries and selectors serves to "force" a theme match for the `None` / both `Neither` case in the active theme table.

Here's an example:

```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    themeVariants({
        baseSelector: "html",
        themes: {
            "not-inverted": {
                selector: "[data-colors=normal]",
                mediaQuery: colorsNotInverted /* @media (inverted-colors: none) */,
            },
            "inverted": {
                selector: "[data-colors=invert]",
                mediaQuery: colorsInverted /* @media (inverted-colors: inverted) */,
            },
        },
        // Since `inverted-colors` has limited browser support, 
        // assume visitors using unsupported browsers do not have their colors inverted
        // and fall back to the "not-inverted" theme
        fallback: true,
        // 💡 Since selectors are being used too, we could even provide 
        // a button on the site that will manually enable/disable inverted colors
    }),
],
```

It has the corresponding active theme table:
<table>
<thead>
<tr>
<th align="left">Match</th>
<th align="left">Neither</th>
<th align="left"><code>inverted-colors: none</code></th>
<th align="left"><code>inverted-colors: inverted</code></th>
</tr>
</thead>

<tbody>
<tr>
<th align="left">Neither</th>
<td align="center"><code>not-inverted</code></td>
<td align="center"><code>not-inverted</code></td>
<td align="center"><code>inverted</code></td>
</tr>

<tr>
<th align="left"><code>html[data-colors=normal]</code></th>
<td align="center"><code>not-inverted</code></td>
<td align="center"><code>not-inverted</code></td>
<td align="center"><code>not-inverted</code></td>
</tr>

<tr>
<th align="left"><code>html[data-colors=invert]</code></th>
<td align="center"><code>inverted</code></td>
<td align="center"><code>inverted</code></td>
<td align="center"><code>inverted</code></td>
</tr>
</tbody>
</table>

## Call the plugin more than once to separate unrelated themes
The list of themes passed to one call of this plugin are intended to be *mutually exclusive*. So, if you have unrelated themes, like a set for motion, and another for light/dark, it doesn't make sense to stuff them all into the same plugin call. Instead, spread them out into two configs to be controlled independently:
```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    themeVariants({
        baseSelector: "html",
        themes: {
            light: { selector: "[data-theme=light]" },
            dark: { selector: "[data-theme=dark]" },
        },
    }),

    themeVariants({
        themes: {
            "motion": { mediaQuery: prefersAnyMotion },
            "no-motion": { mediaQuery: prefersReducedMotion },
        },
        fallback: true,
    }),
]
```

## The ultimate example: how I use every feature together
Because I primarily made this plugin to solve my own problems (a shocking reason, I know!), I take advantage of every feature this plugin provides. Here's an excerpt of the Tailwind CSS config I use on my site:

```js
const { themeVariants, prefersDark, prefersLight } = require("tailwindcss-theme-variants");

module.exports = {
    theme: { 
        // ...
    },

    plugins: [
        themeVariants({
            baseSelector: "html",
            fallback: true,
            themes: {
                "light-theme": { selector: "[data-theme=light]", mediaQuery: prefersLight },
                "dark-theme": { selector: "[data-theme=dark]", mediaQuery: prefersDark },
            },
        }),
    ]
}
```

## Usage with the Tailwind CSS Typography plugin
To use theme variants with the official [Tailwind CSS Typography](https://github.com/tailwindlabs/tailwindcss-typography) plugin, create `prose` modifiers for each theme and use them in the HTML.

Here's an example of changing the prose colors with themes. This covers all of the color settings in the [default typography styles](https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js):

```js
const typography = require("@tailwindcss/typography");
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        extend: {
            typography: (theme) => ({
                light: {
                    css: {
                        color: theme("colors.gray.700"),

                        "a": {
                            color: theme("colors.blue.700"),
                        },

                        "strong": {   
                            color: theme("colors.gray.900"),
                        },

                        "ol > li::before": {
                            color: theme("colors.gray.600"),
                        },
                        "ul > li::before": {
                            backgroundColor: theme("colors.gray.400"),
                        },
                        
                        "hr": {
                            borderColor: theme("colors.gray.300"),
                        },

                        "blockquote": {
                            color: theme("colors.gray.900"),
                            borderLeftColor: theme("colors.gray.300"),
                        },

                        "h1": {
                            color: theme("colors.gray.900"),
                        },
                        "h2": {
                            color: theme("colors.gray.900"),
                        },
                        "h3": {
                            color: theme("colors.gray.900"),
                        },
                        "h4": {
                            color: theme("colors.gray.900"),
                        },

                        "figure figcaption": {
                            color: theme("colors.gray.600"),
                        },

                        "code": {
                            color: theme("colors.gray.900"),
                        },
                        "pre": {
                            color: theme("colors.gray.900"),
                            backgroundColor: theme("colors.gray.100"),
                        },
                        
                        "thead": {
                            color: theme("colors.gray.900"),
                            borderBottomColor: theme("colors.gray.400"),
                        },
                        "tbody tr": {
                            borderBottomColor: theme("colors.gray.300"),
                        },
                    },
                },

                dark: {
                    css: {
                        // These colors were chosen with gray-900 presumed 
                        // to be the page's background color
                        color: theme("colors.gray.200"),

                        "a": {
                            color: theme("colors.blue.400"),
                        },

                        "strong": {   
                            color: theme("colors.white"),
                        },

                        "ol > li::before": {
                            color: theme("colors.gray.300"),
                        },
                        "ul > li::before": {
                            backgroundColor: theme("colors.gray.500"),
                        },
                        
                        "hr": {
                            borderColor: theme("colors.gray.600"),
                        },

                        "blockquote": {
                            color: theme("colors.white"),
                            borderLeftColor: theme("colors.gray.600"),
                        },

                        "h1": {
                            color: theme("colors.white"),
                        },
                        "h2": {
                            color: theme("colors.white"),
                        },
                        "h3": {
                            color: theme("colors.white"),
                        },
                        "h4": {
                            color: theme("colors.white"),
                        },

                        "figure figcaption": {
                            color: theme("colors.gray.300"),
                        },

                        "code": {
                            color: theme("colors.white"),
                        },
                        "pre": {
                            color: theme("colors.white"),
                            backgroundColor: theme("colors.gray.800"),
                        },
                        
                        "thead": {
                            color: theme("colors.white"),
                            borderBottomColor: theme("colors.gray.600"),
                        },
                        "tbody tr": {
                            borderBottomColor: theme("colors.gray.600"),
                        },
                    },
                },
            }),
        },
    },

    plugins: [
        typography,

        themeVariants({
            themes: {
                "light-theme": { ... },
                "dark-theme": { ... },
            },
            fallback: true,
        }),
    ],
};
```

Thanks to @stefanzweifel's [article on the subject](https://stefanzweifel.io/posts/2020/07/20/add-dark-mode-support-to-at-tailwindcsstypography/) and @pspeter3's [issue](https://github.com/tailwindlabs/tailwindcss-typography/issues/69)!

Now that we have appropriate variants for `prose`, let's upgrade our HTML to use them:

```html
<body class="light-theme:bg-white dark-theme:bg-gray-900">
    <article class="prose light-theme:prose-light dark-theme:prose-dark">
        <p>
            Content...
        </p>
    </article>
</body>
```

We will revisit this example in the Semantics section below once I've written that out 😁. Until then, you can reference [this plugin's documentation site's configuration](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/site/prose-styles.js) as an extremely rough guide.


# Semantics
Semantics are an **experimental feature** for this plugin that serve as a better approach to [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*). If you're on Tailwind CSS 1.7 to 1.9, this means they still work on IE11!

TODO. Semantic classes bundle up your design system with this plugin's generated variants. Because I (the plugin author 👋) have to write them, only certain utilities are supported so far:
* `backgroundColor`
* `borderColor`
* `boxShadow`
* `divideColor`
* `gradientColorStops`
* `textColor`

But, when you use the variables feature, you can use *any* utility as long as you can reference `var(--semantic-name)`.


⚠️ They support variants provided by Tailwind's core and by other variant-registering plugins, but ***not* variants created by this plugin!** 

## Constants
TODO. Constants are the easiest way to get started with semantics. They're called "constant" but actually change with each theme; they're just declared "up front" in the `tailwindcss-theme-variants` plugin call / configuration. 
TODO. Constants are declared by specifying a value from your `theme` configuration for each configurable utility in the `semantics` option for each theme in `themes`, like so:

```js
themeVariants({
    themes: {
        light: {
            mediaQuery: prefersLight,
            semantics: {
                colors: {
                    "body": "white",
                    // Use Tailwind CSS's default palette's gray-800
                    // (unless you overrode it in your regular Tailwind CSS theme config)
                    "on-body": "gray-800",
                },
            },
        },
        dark: {
            mediaQuery: prefersDark,
            semantics: {
                colors: {
                    "body": "gray-900",
                    "on-body": "gray-100",
                },
            },
        },
    }
}),
```
Now you have classes like `bg-body` and `text-on-body` that represent `light:bg-white dark:bg-gray-900` and `light:text-gray-800 dark:text-gray-100` respectively at your disposal! Because you can now write semantically named classes, this feature is called *`semantics`*.

### Examples
TODO

## Variables
TODO. Variables are an optional extension on top of constants. If you specify `target: "ie11"` in your **Tailwind** config, then they will be excluded, reducing the generated CSS size.

⚠️ Don't give the same semantic name to multiple utilities in `semantics`; when using variables, they'll collide because they share a global "namespace". TODO: make this not the case.

TODO. Every semantic name also has a corresponding variable. Each variable defaults to the active theme's constant declared in its `semantics` configuration. Variables are automatically used by the semantic utility classes, so you don't have to do anything special to make them work.

For that reason, you can also assign values to semantic variables with the typical custom property syntax
```css
--semantic-variable: 0, 128, 255;
```

To maintain compatibility with the `text-opacity`, `bg-opacity`, etc, utilities, write semantic colors as `r, g, b`.

### Examples
TODO

## Custom semantic utilities

TODO. Just like you can write custom stacked variants, you can write custom semantic utilities. Pass `utilities`, an object of named utilities to `SemanticUtility` interface-compatible objects.



# Alternatives
Both because there are many theme plugins for Tailwind CSS, and because *what's the right way to do theming?* is a frequently asked question, we've compiled this table listing every theme plugin to compare their features and ultimately answer that question.

This table is complicated, so a text summary is also available in [tailwindcss-theming's Alternatives section](https://github.com/innocenzi/tailwindcss-theming#alternatives).

<table>
    <thead>
        <tr>
            <th></th>
            <th><a href="https://tailwindcss.com/docs/dark-mode">Built-in dark mode</a></th>
            <th><a href="https://github.com/benface/tailwindcss-alt">tailwindcss-alt</a></th>
            <th><a href="https://github.com/ChanceArthur/tailwindcss-dark-mode">tailwindcss-dark-mode</a></th>
            <th><a href="https://github.com/danestves/tailwindcss-darkmode">tailwindcss-darkmode</a></th>
            <th><a href="https://github.com/estevanmaito/tailwindcss-multi-theme">tailwindcss-multi-theme</a></th>
            <th><a href="https://github.com/javifm86/tailwindcss-prefers-dark-mode">tailwindcss-prefers-dark-mode</a></th>
            <th><a href="https://github.com/crswll/tailwindcss-theme-swapper">tailwindcss-theme-swapper</a></th>
            <th><a href="https://github.com/JakeNavith/tailwindcss-theme-variants">tailwindcss-theme-variants</a></th>
            <th><a href="https://github.com/innocenzi/tailwindcss-theming">tailwindcss-theming</a></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Controllable with selectors (classes or data attributes)</th>
            <td>🟡</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>🟡</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Responsive</th>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Supports <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme"><code>prefers-color-scheme: dark</code></a></th>
            <td>🟡</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>🟡</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Supports <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme"><code>prefers-color-scheme: light</code></a></th>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Supports other media queries like <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency"><code>prefers-reduced-transparency</code></a></th>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>❌</td>
        </tr>
    </tbody>
</table>

## Legend
**Responsive**: While "inside" of a theme, it must be possible to "activate" classes depending on the current breakpoint. For instance, it has to be possible to change `background-color` when **both** the screen is `sm` **and** the current theme is `dark`.

**Supports `prefers-color-scheme` or other media queries**: Because [any media query can be detected in JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), any plugin marked as not supporting [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) could "support" it by adding or removing classes or data attributes, like the [`prefers-dark.js` script](https://github.com/ChanceArthur/tailwindcss-dark-mode/blob/master/prefers-dark.js) does. This approach still comes with the caveats that
1. JavaScriptless visitors will not have the site's theme reflect their preferred one
2. It could still be possible for a flash of unthemed content to appear before the appropriate theme is activated (unless you block rendering by executing the script immediately in `head`)
3. Your site will immediately jump between light and dark instead of smoothly transitioning with the rest of the screen on macOS

**[tailwindcss-prefers-dark-mode](https://github.com/javifm86/tailwindcss-prefers-dark-mode)** and **[built-in dark mode](https://tailwindcss.com/docs/dark-mode)**: cannot use selectors and media queries at the same time; it's one or the other, so you have to put a ✅ in one row and ❌ in the other.


# 📄 License and Contributing

MIT licensed. There are no contributing guidelines. Just do whatever you want to point out an issue or feature request and I'll work with it.
