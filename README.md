# 🌗 Tailwind CSS Theme Variants
**This Tailwind CSS plugin registers variants for theming beyond just light and dark modes *without needing custom properties***. It has support for 
* Controlling themes with 
  * **Media queries**, like [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), `print`, or anything you want
  * **CSS selectors**, like classes and data attributes
  * Or both at the same time!
* **Responsive** variants
* **Stacking** on extra **variants**, like `hover` so you can change a link's hover color depending on the theme
* **Falling back** to a certain theme when no other one could become active, like if a visitor's browser doesn't support JavaScript or the new `prefers-` media queries
* **As many themes as you want**: light theme, dark theme, red theme, blue theme—just bring your own definitions! 

You are recommended to check out [the comparison table of all Tailwind CSS theming plugins below](#alternatives) before committing to any one. By the way, you might have noticed this plugin's documentation / `README` is *very* long—don't let that frighten you! I designed it to be *overdocumented* and as exhaustive as possible, and since most of that length is made up of long code snippets, it's shorter than it looks *and* you don't need to go through it all to do well!

However, if you want your site to have a very large number of themes (say, 4 or more) or potentially infinite themes (such as could be configured by your users), then **this plugin is not for you**. You will probably be better off using a custom properties setup; refer back to [that table 👇](#alternatives).

### What about when dark mode support becomes official in Tailwind CSS 2.0?
**This plugin will still be maintained!** Light and dark mode support is *just* one thing this plugin can do. Furthermore, I don't anticipate that the complexity this plugin can provide will be reflected in Tailwind core, so I will still need this around.

# ⬇️ Installation

```sh
npm install --save-dev tailwindcss-theme-variants
```

# 🛠 Basic usage

## Using selectors to choose the active theme

With this Tailwind configuration,

```js
const { tailwindcssThemeVariants } = require("tailwindcss-theme-variants");

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

/* If you're having trouble understanding,
   imagine it said html instead of :root,
   like in the example HTML below */

:root.light-theme .light\:bg-gray-900 {
    background-color: #1A202C;
}

:root.dark-theme .dark\:bg-gray-900 {
    background-color: #1A202C;
}
```

After also enabling `"light"` and `"dark"` variants for `textColor` and bringing in more colors from the [default palette](https://tailwindcss.com/docs/customizing-colors/#default-color-palette), we can implement a simple themed button in HTML like this:

```html
<html class="light-theme"> <!-- Change to dark-theme -->
    <button class="light:bg-teal-200 dark:bg-teal-800 light:text-teal-700 dark:text-teal-100">
        Sign up
    </button>
</html>
```

This will result in dark blue text on a light blue background in the light theme, and light blue text on a dark blue background in the dark theme.

💡 You can choose more than just classes for your selectors. Other, good options include data attributes, like `[data-padding=compact]`. You *can* go as crazy as `.class[data-theme=light]:dir(rtl)`, for example, but I think that's a bad idea!


## Using media queries to choose the active theme

You may rather choose to tie your theme selection to matched media queries, like [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme):

```js
const { tailwindcssThemeVariants, prefersLight, prefersDark } = require("tailwindcss-theme-variants");

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

💡 Keep the `variants` listed in the same order as in `themes` in this plugin's configuration for consistency and the most expected behavior. In `backgroundColor`'s `variants`, `light` came first, then `dark`, so we also list `light` before `dark` in `tailwindcssThemeVariants`'s `themes` option. If you use the `group` feature, this will be taken care of for you!

# ⚙️ Full configuration

This plugin expects configuration of the form

```ts
{
    group?: string;
    
    themes: {
        [name: string]: {
            // At least one is required
            selector?: string;
            mediaQuery?: string;
        }
    };

    baseSelector?: string;
    fallback?: boolean;

    variants?: {
        [name: string]: (selector: string) => string;
    };
}
```

Where each parameter means:

- `group` (defaults to not making a group name): the name of the group of themes in this configuration. For example, a sensible name for `light` and `dark` would be `themes` or `modes`. This will create a `themes` (or `modes`) variant that can be listed in `variants` to generate all the CSS for both `light` and `dark` themes in the correct order (matching your configuration). If you provide extra variants to stack (explained in the `variants` description below), like `focus`, then similarly named variants like `themes:focus` will be created.

- `themes`: an object mapping a theme name to the conditions that determine whether or not the theme will be active.

   - `selector`: a selector that has to be active on `baseSelector` for this theme to be active. For instance, if `baseSelector` is `html`, and `themes.light`'s `selector` is `.light-theme`, then the `light` theme's variant(s) will be in effect whenever `html` has the `light-theme` class on it.

   - `mediaQuery`: a media query that has to be active for this theme to be active. For instance, if the `reduced-motion` theme has `mediaQuery` `"@media (prefers-reduced-motion: reduce)"` (importable as `prefersReducedMotion`), then the `reduced-motion` variant(s) will be active whenever that media query matches: if the visitor's browser reports preferring reduced motion.

- `baseSelector` (default `""` (empty string) if you **only** use media queries to activate your themes, otherwise `":root"`): the selector that each theme's `selector` will be applied to to determine the active theme.

- `fallback` (default `false`): chooses a theme to fall back to when none of the media queries or selectors are active. If you pass `true`, then the first theme you listed in `themes` will be the theme that is fallen back to. You can think of it as the *default* theme for your site.

- `variants` (default is nothing): an object mapping the name of a variant to a function that gives a selector for when that variant is active. 

  For example, the importable `even` variant takes a `selector` and returns `` `${selector}:nth-child(even)` ``. The importable `groupHover` (which you are recommended to name `"group-hover"` for consistency) variant returns `` `.group:hover ${selector}` ``

  Each given name and function pair will create an appropriately named variant in combination with each theme for use in the `variants` section of your Tailwind CSS config, like `amoled:hover` if you have an `amoled` theme and a `hover` variant in this plugin's configuration.


# Examples
💡 If you want to see the plugin get stretched to its limits, see the test suite in [`the tests directory`](https://github.com/SirNavith/tailwindcss-theme-variants/blob/master/tests).

## Theme groups
Specifying `group` in this plugin's configuration will create a magical variant you can use in place of manually typing out every single theme's name in the Tailwind `variants` section!

For instance, you saw before that 

```js
const { tailwindcssThemeVariants, prefersLight, prefersDark } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {},

    variants: {
        backgroundColor: ["light", "dark"],
        textColor: ["hover", "light", "dark"],
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
<tr align="center">
<th align="left">Matching media query</th>
<th>Neither</th>
<th><code>prefers-color-scheme: light</code></th>
<th><code>prefers-color-scheme: dark</code></th>
</tr>

<tr align="center">
<th align="left">Active theme</th>
<td>None</td>
<td><code>light</code></td>
<td><code>dark</code></td>
</tr>
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
    background-color: #38B2AC;
}

/* New addition */
.light\:bg-teal-500 {
    background-color: #38B2AC;
}
/* End new addition */

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

Which, in turn, changes the active theme table to:
<table>
<tr align="center">
<th align="left">Matching media query</th>
<th>Neither</th>
<th><code>prefers-color-scheme: light</code></th>
<th><code>prefers-color-scheme: dark</code></th>
</tr>

<tr align="center">
<th align="left">Active theme</th>
<td><code>light</code></td>
<td><code>light</code></td>
<td><code>dark</code></td>
</tr>
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

**Fallback always chooses the first theme in your list of themes.** To choose a different theme, just change the order of `themes`.

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
<tr>
<th align="left">Matching selector</th>
<th align="left">Active theme</th>
</tr>

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
</table>


## Stacked variants
💡 All of Tailwind CSS's core variants and more are bundled for use with this plugin. You can see the full list in [`src/variants.ts`](https://github.com/SirNavith/tailwindcss-theme-variants/blob/master/src/variants.ts).

By specifying `variants` in this plugin's options, you can "stack" extra variants on top of the existing theme variants. (We call it *stacking* because there are multiple variants required, like in `night:focus:border-white`, the border will only be white if the `night` theme is active **and** the element is `:focus`ed on).

Here's an example of combining [`prefers-contrast: high`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) (which you can import as `prefersHighContrast`) with the `:hover` variant (which you can import as `hover`):
```js
const { tailwindcssThemeVariants, hover, prefersHighContrast } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    variants: {
        backgroundColor: ["high-contrast"],
        textColor: ["high-contrast", "high-contrast:hover"],
    },

    plugins: [
        tailwindcssThemeVariants({
            themes: {
                "high-contrast": {
                    mediaQuery: prefersHighContrast /* "@media (prefers-contrast: high)" */,
                },
            },
            variants: {
                "hover": hover /* (selector) => `${selector}:hover` */,
            },
        }),
    ],
};
```

You could create a simple card that uses contrast pleasant for fully sighted visitors, but intelligently switches to functional high contrast for those who specify it:
```html
<div class="bg-gray-100 high-contrast:bg-white text-gray-800 high-contrast:text-black">
    <h1>Let me tell you all about...</h1>
    <h2>... this great idea I have!</h2>

    <a href="text-blue-500 high-contrast:text-blue-700 hover:text-blue-600 high-contrast:hover:text-blue-900">
        See more
    </a>
</div>
```

#### Writing a custom variant function
You might need to write a variant function yourself if it's not `export`ed with this plugin. 

It's common to use the same styles on links and buttons when they are hovered over or focused on, so you may want to make things easier for yourself and reduce duplication by creating a `"hocus"` variant that activates for **either** `:hover` **or** `:focus`.

```js
const { tailwindcssThemeVariants, hover, odd } = require("tailwindcss-theme-variants");

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
        tailwindcssThemeVariants({
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
            fallback: true,
            variants: {
                // The custom variant function, written by you
                hocus: (selector) => `${selector}:hover, ${selector}:focus`,
            },
        }),
    ],
};
```

With this, let's try making an icon button that's overlaid on top of an image in HTML. This button is generally translucent and becomes more opaque on hover or focus, but now can be made more visually distinct for visitors who need it.
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
const { tailwindcssThemeVariants, hover, odd } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },

    variants: {
        backgroundColor: ["accents", "accents:hover", "accents:odd", "accents:odd:hover"],
    },

    plugins: [
        tailwindcssThemeVariants({
            group: "accents",
            baseSelector: "table.themed",
            themes: {
                "no-accent": { selector: "" },
                "green-accent": { selector: ".themed-green" },
                "orange-accent": { selector: ".themed-orange" },
            },
            variants: {
                hover /* (selector) => `${selector}:hover` */,
                odd /* (selector) => `${selector}:nth-child(odd)` */,

                // The custom variant function, written by you
                "odd:hover": (selector) => `${selector}:nth-child(odd):hover`,
                // There is nothing special about the : in odd:hover
                // It's just meant to signify that there's an extra variant to your brain

                // By the way, the ordering here doesn't matter
                // (as opposed to the ordering of variants above)
            },
        }),
    ],
};
```

💡 By the way, you might have noticed the `"odd:hover"` function would result in the same thing as calling `hover(odd(selector))`. This gives you the perfect opportunity to use function composition, like [Lodash's `flow`](https://lodash.com/docs/4.17.15#flow) or the [pipeline operator](https://github.com/tc39/proposal-pipeline-operator), to reuse the given variant functions in [`src/variants.ts`]((https://github.com/SirNavith/tailwindcss-theme-variants/blob/master/src/variants.ts)) or write your own. For instance, you could create a `"focused-alert-placeholder"` variant with value ``_.flow([focus, (selector) => `${selector}[aria-role=alert]`, placeholder])`` variant to style anything `:focus[role=alert]::placeholder`! *If you don't know what the heck I'm talking about, just pretend this isn't even here.*

Back to the topic at hand: we can then implement the themeable table in HTML (Svelte) like so:

```html
<table class="themed themed-green"> <!-- Try changing themed-green to themed-orange or removing it -->
    {#each people as person}
        <tr class="no-accent:bg-white               green-accent:bg-green-50             orange-accent:bg-orange-50
                   no-accent:hover:bg-gray-100      green-accent:hover:bg-green-100      orange-accent:hover:bg-orange-100
                   no-accent:odd:bg-gray-100        green-accent:odd:bg-green-100        orange-accent:orange-accent:odd:bg-orange-100
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
Responsive variants let you distinguish the current breakpoint per theme, letting you say `lg:green-theme:border-green-200` to have a `green-200` border only when the breakpoint is `lg` (or larger) **and** the `green-theme` is active, for instance.

⚠️ Responsive variants are automatically generated whenever `responsive` is listed in the utility's `variants` in the Tailwind CSS configuration, **not** this plugin's configuration. Also, because this feature is provided by Tailwind CSS rather than this plugin, you have to type `breakpoint:` **before** the `theme-name:` instead of after.

```js
const { tailwindcssThemeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },
    variants: {
        textColor: ["responsive", "day", "night"]
    },
    plugins: [
        tailwindcssThemeVariants({
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
const { tailwindcssThemeVariants } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {
        // Your Tailwind CSS theme configuration
    },
    variants: {
        padding: ["responsive", "density"]
    },
    plugins: [
        tailwindcssThemeVariants({
            group: "density",
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
You can still stack extra variants even while using responsive variants.

Here's an example:
```js
const { tailwindcssThemeVariants, hover, landscape, portrait } = require("tailwindcss-theme-variants");

module.exports = {
    theme: {}
    variants: {
        // If you haven't seen the `group` feature yet:
        // Instead of needing to write out ["landscape", "portrait", "landscape:hover", "portrait:hover"],
        // We can just name the group "orientation" and write ["orientation", "orientation:hover"]
        fontSize: ["responsive", "hover", "orientation", "orientation:hover"],
    },
    plugins: [
        tailwindcssThemeVariants({
            group: "orientation",
            themes: {
                landscape: {
                    mediaQuery: landscape,
                },
                portrait: {
                    mediaQuery: portrait,
                },
            },
            variants: {
                hover,
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

**Every feature previously discussed will still work as you'd expect**, even when you decide to also add selectors or media queries to theme control. When both selectors and media queries are in use, **selectors will always take priority over media queries**. This allows the flexibility of *defaulting* to media queries while still being able to override with JavaScript-controlled selectors (like classes and data attributes)!

For example, see this plugin call:
```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    tailwindcssThemeVariants({
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
<tr>
<th align="left">Match</th>
<th align="left">Neither</th>
<th align="left"><code>prefers-color-scheme: light</code></th>
<th align="left"><code>prefers-color-scheme: dark</code></th>
</tr>

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
</table>

As previously noted, when a required selector is present, it takes precendence over the media queries; stated another way, the media queries only matter when no selector matches.

⚠️ If you are stacking variants on while using both selectors and media queries to activate themes, then **make sure that each stacked variant is specified as an *all or nothing* approach** on each element. For instance, if you have `normal-motion` and `reduced-motion` themes and want to add the `reduced-motion:hover:transition-none` class, then you also need to add the `normal-motion:hover:transition` class (or any [value of `transitionProperty`](https://tailwindcss.com/docs/transition-property/)). If you don't do this, then it will look like the values from a theme that's *supposed* to be inactive are "leaking" into the active theme.

### Fallback
Like when just selectors or just media queries are used for theme selection, the fallback feature for both media queries and selectors serves to "force" a theme match for the `None` / both `Neither` case in the active theme table.

Here's an example:

```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    tailwindcssThemeVariants({
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
<tr>
<th align="left">Match</th>
<th align="left">Neither</th>
<th align="left"><code>inverted-colors: none</code></th>
<th align="left"><code>inverted-colors: inverted</code></th>
</tr>

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
</table>

## Call the plugin more than once to separate unrelated themes
The list of themes passed to one call of this plugin are intended to be *mutually exclusive*. So, if you have unrelated themes, like a set for motion, and another for light/dark, it doesn't make sense to stuff them all into the same plugin call. Instead, spread them out into two configs to be controlled independently:
```js
// Rest of the Tailwind CSS config and imports...
plugins: [
    tailwindcssThemeVariants({
        baseSelector: "html",
        themes: {
            light: { selector: "[data-theme=light]" },
            dark: { selector: "[data-theme=dark]" },
        },
        variants: {
            hover,
            focus,
        }
    }),

    tailwindcssThemeVariants({
        themes: {
            "motion": { mediaQuery: prefersAnyMotion },
            "no-motion": { mediaQuery: prefersReducedMotion },
        },
        fallback: true,
    }),
]
```

By the way, if you're not using it yet, this is the perfect opportunity to embrace the `group` configuration option. Instead of manually typing out all the  

## The ultimate example: how I use every feature together in production
Because I primarily made this plugin to solve my own problems (a shocking reason, I know!), I take advantage of every feature this plugin provides. Here's an excerpt of the Tailwind CSS config I use on my site:

```js
const defaultConfig = require("tailwindcss/defaultConfig");
const { tailwindcssThemeVariants, focus, groupFocus, groupHover, hover, prefersDark, prefersLight, selection } = require("tailwindcss-theme-variants");

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
        tailwindcssThemeVariants({
            group: "themes",
            baseSelector: "html",
            fallback: "light-theme",
            themes: {
                "light-theme": { selector: "[data-theme=light]", mediaQuery: prefersLight },
                "dark-theme": { selector: "[data-theme=dark]", mediaQuery: prefersDark },
            },
            variants: {
                focus,
                "group-focus": groupFocus,
                "group-hover": groupHover,
                hover,
                selection,
            },
        }),
    ]
}
```

# Alternatives
Both because there are many theme plugins for Tailwind CSS, and because *what's the right way to do theming?* is a frequently asked question, we've compiled this table listing every theme plugin to compare their features and ultimately answer that question:

<table>
    <thead>
        <tr>
            <th></th>
            <th><a href="https://tailwindcss.com/docs/breakpoints/#dark-mode">Native screens</a></th>
            <th><a href="https://github.com/ChanceArthur/tailwindcss-dark-mode">tailwindcss-dark-mode</a></th>
            <th><a href="https://github.com/danestves/tailwindcss-darkmode">tailwindcss-darkmode</a></th>
            <th><a href="https://github.com/estevanmaito/tailwindcss-multi-theme">tailwindcss-multi-theme</a></th>
            <th><a href="https://github.com/javifm86/tailwindcss-prefers-dark-mode">tailwindcss-prefers-dark-mode</a></th>
            <th><a href="https://github.com/crswll/tailwindcss-theme-swapper">tailwindcss-theme-swapper</a></th>
            <th><a href="https://github.com/SirNavith/tailwindcss-theme-variants">tailwindcss-theme-variants</a></th>
            <th><a href="https://github.com/innocenzi/tailwindcss-theming">tailwindcss-theming</a></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>Classes can be <code>@apply</code>ed</th>
            <td>🟡</td>
            <td>🟡</td>
            <td>🟡</td>
            <td>🟡</td>
            <td>🟡</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Controllable with selectors (classes or data attributes)</th>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>🟡</td>
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
            <td>❌</td>
            <td>✅</td>
            <td>❌</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Responsive</th>
            <td>❌</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Stacked variants like <code>hover</code></a></th>
            <td>✅</td>
            <td>🟡</td>
            <td>🟡</td>
            <td>🟡</td>
            <td>🟡</td>
            <td>✅</td>
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Supports <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme"><code>prefers-color-scheme: dark</code></a></th>
            <td>✅</td>
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
            <td>✅</td>
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
            <td>✅</td>
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

### Legend
**Classes can be `@apply`ed**: 

As of Tailwind CSS 1.7, *any* class can be `@apply`ed with the [`applyComplexClasses` experimental feature](https://github.com/tailwindlabs/tailwindcss/releases/tag/v1.7.0#use-apply-with-variants-and-other-complex-classes).

```css
.btn-blue {
    /* Now, it all just works! */
    @apply light:bg-blue-100 light:text-blue-800;
    @apply dark:bg-blue-700 dark:text-white;
}
```

**The following information is applicable to versions of Tailwind before 1.7 or without `applyComplexClasses` enabled:**

[Native screens](https://tailwindcss.com/docs/breakpoints/#dark-mode) cannot have their generated classes `@apply`ed, but you can still nest an `@screen` directive within the element, like this: 
```css
.btn-blue {
    @apply bg-blue-100 text-blue-800;
    /* Wouldn't have worked: @apply dark:bg-blue-700 dark:text-white */
    @screen dark {
        @apply bg-blue-700 text-white;
    }
}
```
This may require nesting support, provided by [`postcss-nested`](https://github.com/postcss/postcss-nested) or [`postcss-nesting`](https://github.com/jonathantneal/postcss-nesting) (part of [`postcss-preset-env`](https://github.com/csstools/postcss-preset-env)).

As for theme plugins that are controlled with CSS selectors like classes and data attributes, you can nest whatever selector that may be (in this example `.theme-dark`) inside of the component's block, similarly to `@screen`:
```css
.btn-blue {
    @apply bg-blue-100 text-blue-800;
    /* Wouldn't have worked: @apply dark:bg-blue-700 dark:text-white */
    .theme-dark & {
        @apply bg-blue-700 text-white;
    }
}
```

**Requires <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*">custom properties</a>**: Plugins who meet this description (have a ✅) usually have you write semantically named classes like `bg-primary`, `text-secondary`, etc, and swap out what `primary` and `secondary` mean with custom properties depending on the theme. This means that in IE11, themes cannot be controlled, and in some cases the default theme won't work at all without [preprocessing](https://github.com/postcss/postcss-custom-properties).

**Responsive**: While "inside" of a theme, it must be possible to "activate" classes / variants depending on the current breakpoint. For instance, it has to be possible to change `background-color` when **both** the screen is `sm` **and** the current theme is `dark`.

**Stacked variants**: While "inside" of a theme, it must be possible to "activate" classes / variants depending on pseudoselector conditions, such as `:focus`, `:nth-child(even)`, `.group:hover `, etc.

Plugins that have a 🟡 support only some of the variants in Tailwind's core, and none that come from other variant-registering plugins.

**Supports `prefers-color-scheme` or other media queries**: Because [any media query can be detected in JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), any plugin marked as not supporting [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) could "support" it by adding or removing classes or data attributes, like can be seen in the [`prefers-dark.js` script](https://github.com/ChanceArthur/tailwindcss-dark-mode/blob/master/prefers-dark.js) that some theme plugins recommend. This approach still comes with the caveats that
1. JavaScriptless visitors will not have the site's theme reflect their preferred one
2. It could still be possible for a flash of unthemed content to appear before the appropriate theme is activated
3. Your site will immediately jump between light and dark instead of smoothly transitioning with the rest of the screen on macOS

**[`tailwindcss-prefers-dark-mode`](https://github.com/javifm86/tailwindcss-prefers-dark-mode)**: cannot use selectors and media queries at the same time; it's one or the other, so you have to put a ✅ in one row and ❌ in the other.


# 📄 License and Contributing

MIT licensed. There are no contributing guidelines. Just do whatever you want to point out an issue or feature request and I'll work with it.


---

*Repository preview image generated with [GitHub Social Preview](https://social-preview.pqt.dev/)*
