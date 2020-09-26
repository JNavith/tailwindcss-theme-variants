# Examples
💡 If you want to see the plugin get stretched to its limits, see the test suite in [`the tests directory`](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/tests).

## Theme groups
Specifying `group` in this plugin's configuration will create a magical variant you can use in place of manually typing out every single theme's name in the Tailwind `variants` section!

For instance, you saw before that 

```js
const { themeVariants, prefersLight, prefersDark } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {},

    variants: {
        backgroundColor: ["light", "dark"],
        textColor: ["hover", "light", "dark"],
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

will generate CSS with `light` classes then `dark` classes, but as you create more themes or start playing with the `fallback` feature and stacking variants, it becomes unmaintainable to keep writing all the theme variants out in `variants`. **Introducing: the `group` feature.**

We can clean things up by calling this group `"schemes"` for example, and use that in the `variants` list instead:
```js
const { themeVariants, prefersLight, prefersDark } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {},

    variants: {
        backgroundColor: ["schemes"],
        textColor: ["hover", "schemes"],
    },

    plugins: [
        themeVariants({
            group: "schemes",
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

This will generate the exact same output CSS, but we are making things easier for ourselves as our plugin configuration becomes more complex.

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

/* New addition */
.light\:bg-teal-500 {
    background-color: #38B2AC
}
/* End new addition */

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

:root:not(.light-theme) .dark\:bg-gray-900 {
    background-color: #1A202C;
}

:root.dark-theme .dark\:bg-gray-900 {
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
💡 All of Tailwind CSS's core variants and more are bundled for use with this plugin. You can see the full list in [`src/variants.ts`](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/src/variants.ts).

You can "stack" built-in or custom variants on top of the existing theme variants. We call it *stacking* because multiple variants are required: like in `night:focus:border-white`, the border will only be white if the `night` theme is active **and** the element is `:focus`ed on.

Here's an example of combining [`prefers-contrast: high`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) with the `:hover` variant:
```js
const { themeVariants, prefersHighContrast } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    variants: {
        backgroundColor: ["high-contrast"],
        textColor: ["high-contrast", "high-contrast:hover"],
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

### Writing a custom variant function
You might need to write a variant function yourself if it's not [built-in to this plugin](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/src/variants.ts). 

It's common to use the same styles on links and buttons when they are hovered over or focused on, so you may want to make things easier for yourself and reduce duplication by creating a `"hocus"` variant that activates for **either** `:hover` **or** `:focus`.

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    variants: {
        opacity: [
            "transparency-safe",        "transparency-reduce",
            "transparency-safe:hocus",  "transparency-reduce:hocus",
        ],
    },

    plugins: [
        themeVariants({
            themes: {
                "transparency-safe": { 
                    mediaQuery: prefersAnyTransparency /* "@media (prefers-reduced-transparency: no-preference)" */,
                },
                "transparency-reduce": { 
                    mediaQuery: prefersReducedTransparency /* "@media (prefers-reduced-transparency: reduce)" */,
                },
            },
            // prefers-reduced-transparency is not supported in any browsers yet,
            // so assume an unsupported browser means the visitor is okay with transparency effects
            fallback: "compact",
            // If you haven't seen "compact" yet, it's the same as true
            // but reduces resulting CSS file size by a lot
            variants: {
                // The custom variant function you wrote
                hocus: (selector) => `${selector}:hover, ${selector}:focus`,
            },
        }),
    ],
};
```

With this, let's try making an icon button that's overlaid on top of an image in HTML. This button is generally translucent and becomes more opaque on hover or focus, but can be more visually distinct for visitors who need it.
```html
<div>
    <button 
        @click="..."
        class="transparency-safe:opacity-25 transparency-safe:hocus:opacity-75
               transparency-reduce:opacity-75 transparency-reduce:hocus:opacity-100
               rounded-full text-white bg-black ...">

        <svg class="fill-current positioning-classes...">
            <!-- Path definitions... -->
        </svg>
    </button>

    <img src="..." class="positioning-classes...">
</div>
```

Another—complex—example: suppose you want to zebra stripe your tables, matching the current theme, and change it on hover:

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    variants: {
        backgroundColor: ["accents", "accents:hover", "accents:odd", "accents:odd-hover"],
    },

    plugins: [
        themeVariants({
            group: "accents",
            baseSelector: "table.themed",
            themes: {
                "no-accent": { selector: "" },
                "green-accent": { selector: ".themed-green" },
                "orange-accent": { selector: ".themed-orange" },
            },
            variants: {
                // The custom variant function you wrote
                "odd-hover": (selector) => `${selector}:nth-child(odd):hover`,

                // By the way, the ordering here doesn't matter
                // (as opposed to the ordering of variants in Tailwind's config above)
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
                   no-accent:odd-hover:bg-gray-200  green-accent:odd-hover:bg-green-200  orange-accent:odd-hover:bg-orange-100
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

⚠️ Responsive variants generate for utilities with `"responsive"` in *Tailwind*'s `variants` config, **not** this plugin's config. Also, because this feature is provided by Tailwind CSS rather than this plugin, you have to type `breakpoint:` **before** the `theme-name:` instead of after.

```js
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },
    variants: {
        textColor: ["responsive", "day", "night"]
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
    variants: {
        padding: ["responsive", "density"]
    },
    plugins: [
        themeVariants({
            group: "density",
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
    theme: {}
    variants: {
        // If you haven't seen the `group` feature yet:
        // Instead of needing to write out "landscape", "portrait", "landscape:hover", "portrait:hover",
        // We can name the group "orientation" and only write "orientation", "orientation:hover"
        fontSize: ["responsive", "hover", "orientation", "orientation:hover"],
    },
    plugins: [
        themeVariants({
            group: "orientation",
            themes: {
                landscape: {
                    mediaQuery: landscape,
                },
                portrait: {
                    mediaQuery: portrait,
                },
            },
        }),
    ],
};
```

We can make an `h1` change size based on orientation *and* breakpoint *and* hover for readability (this is definitely a contrived example):

```html
<h1 class="text-sm             landscape:text-base          portrait:text-xs
           sm:text-base        sm:landscape:text-lg         sm:portrait:text-sm
           sm:hover:text-lg    sm:landscape:hover:text-xl   sm:portrait:hover:text-md
           lg:text-xl          lg:landscape:text-2xl        lg:portrait:text-lg
           lg:hover:text-2xl   lg:landscape:hover:text-3xl  lg:portrait:hover:text-xl">
    
    This article title will try to change size so that it stays readable... hopefully.
</h1>
```

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
        // Since selectors are being used too, we could even provide 
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

💡 If you're using `fallback: true`, now would be a good time to try out `fallback: "compact"` to reduce generated CSS size without changing anything else. Because using both selectors and media queries to activate themes results in *a ton* of CSS, the benefits of `compact`ing it are great now! If you encounter any problems, then you should [create an issue](https://github.com/JakeNavith/tailwindcss-theme-variants/issues) and switch back to `true` until it's resolved.

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

By the way, if you're not using it yet, this is the perfect opportunity to embrace the `group` configuration option. Instead of manually typing out all the combinations of *every* theme and *every* stacked variant, you can bring it back down to just per group per stacked variant.

```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    themeVariants({
        group: "themes",
        baseSelector: "html",
        themes: {
            light: { selector: "[data-theme=light]" },
            dark: { selector: "[data-theme=dark]" },
        },
    }),

    themeVariants({
        group: "motion-preference",
        themes: {
            "motion": { mediaQuery: prefersAnyMotion },
            "no-motion": { mediaQuery: prefersReducedMotion },
        },
        fallback: true,
    }),
]
```

Now you have magic `"themes"` and `"motion-preference"` variants that are guaranteed to generate the CSS in the correct order, so you should use these instead of `"light", "dark"` and `"motion", "no-motion"` respectively. You'll even get stacked variants like `"themes:group-focus"` or `"motion-preference:hover"`.

## The ultimate example: how I use every feature together
Because I primarily made this plugin to solve my own problems (a shocking reason, I know!), I take advantage of every feature this plugin provides. Here's an excerpt of the Tailwind CSS config I use on my site:

```js
const defaultConfig = require("tailwindcss/defaultConfig");
const { themeVariants, prefersDark, prefersLight } = require("tailwindcss-theme-variants");

const { theme: defaultTheme, variants: defaultVariants } = defaultConfig;

module.exports = {
    theme: { 
        // ...
    },

    variants: {
        backgroundColor: [
            ...defaultVariants.backgroundColor,
            "themes",
            "themes:hover",
            "themes:focus",
            "themes:selection",
        ],
        boxShadow: [...defaultVariants.boxShadow, "themes", "themes:focus"],
        textColor: [
            ...defaultVariants.textColor,
            "themes",
            "themes:group-focus",
            "themes:group-hover",
            "themes:hover",
            "themes:focus",
            "themes:selection",
        ],
    },

    plugins: [
        themeVariants({
            group: "themes",
            baseSelector: "html",
            fallback: "light-theme",
            themes: {
                "light-theme": { selector: "[data-theme=light]", mediaQuery: prefersLight },
                "dark-theme": { selector: "[data-theme=dark]", mediaQuery: prefersDark },
            },
            // I personally only need the built-in variants so I don't specify any custom ones here
        }),
    ]
}
```

## Usage with the Tailwind CSS Typography plugin
To use theme variants with the official [Tailwind CSS Typography](https://github.com/tailwindlabs/tailwindcss-typography) plugin, create `prose` modifiers for each theme and list the theme variants in the `typography` variants array.

Here's an example of changing the prose colors with your themes. This covers all of the color settings in the [default typography styles](https://github.com/tailwindlabs/tailwindcss-typography/blob/master/src/styles.js):

```js
const typography = require("@tailwindcss/typography");
const { themeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
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
                    // These colors were chosen with gray-900 presumed to be the background color
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

    variants: {
        typography: ({ after }) => after(["themes"]),
    },

    plugins: [
        typography,
        themeVariants({
            group: "themes",
            themes: {
                "light-theme": { ... },
                "dark-theme": { ... },
            },
            fallback: "compact",
        }),
    ],
};
```

Thanks to @stefanzweifel's [article on the subject](https://stefanzweifel.io/posts/2020/07/20/add-dark-mode-support-to-at-tailwindcsstypography/) and @pspeter3's [issue](https://github.com/tailwindlabs/tailwindcss-typography/issues/69)!

Now that you have appropriate variants for `prose`, let's upgrade our HTML to use them:

```html
<article class="prose light-theme:prose-light dark-theme:prose-dark">
    <p>
        Content...
    </p>
</article>
```

We will revisit this example in the Semantics section below once the semantics feature is implemented 😁. Until then, you can reference [this plugin's documentation site's configuration](https://github.com/JakeNavith/tailwindcss-theme-variants/blob/main/site/tailwind.config.js) as a rough and messy guide.
