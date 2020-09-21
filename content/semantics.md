# Semantics
Semantics are a planned / work in progress feature for this plugin that are meant to be an alternative to [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (read: have 100% browser support since IE9). If you're really eager, you can keep up with `semantics` development by watching the test suite in `tests/semantics.ts` grow with time 😎.

**The following sections are written in present tense but talk about features that are not implemented yet, so don't try to use them:**

**Semantics require Tailwind CSS 1.7 or higher. Also, the [`applyComplexClasses` experimental feature](https://github.com/tailwindlabs/tailwindcss/pull/2159) will be enabled for you if you use semantics because it's required for them to work.**

TODO. Semantics are available as utility classes that bundle up your provided values with this plugin's generated variants. Because they have to be written by me (the plugin author 👋), only certain utilities are supported so far:
* `backgroundColor`
* `borderColor`
* `boxShadow`
* `divideColor`
* `textColor`

In the future it'll be possible to let you, the user, write custom utility classes for use with semantics similarly to how you can write your own variants.

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
TODO. Variables are an optional extension on top of constants. If you specify `target: "ie11"` in your **Tailwind** config, then they will be disabled.

⚠️ Don't give the same semantic name to multiple utilities in `semantics`; when using variables, they'll collide because they share a global "namespace".

TODO. Every semantic name also has a corresponding variable; the variable defaults to each theme's constant declared in the theme's `semantics` configuration. Variables are automatically used by the semantic utility classes, so you don't have to do anything special to make them work.

For that reason, you can also assign values to semantic variables with the typical custom property syntax
```css
--semantic-variable: 0, 128, 255;
```

All semantic colors need to be written as `r, g, b` to maintain compatibility with the `text-opacity`, `bg-opacity`, etc, utilities.

### Examples
TODO