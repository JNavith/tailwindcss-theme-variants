# Semantics
Semantics are an **experimental feature** for this plugin that serve as an alternative to [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) (read: have 100% browser support since IE9).

**Semantics require Tailwind CSS 1.7 or higher. Also, the [`applyComplexClasses` experimental feature](https://github.com/tailwindlabs/tailwindcss/pull/2159) will be enabled for you if you use semantics because it's required for them to work.**

TODO. Semantic classes bundle up your design system with this plugin's generated variants. Because I (the plugin author 👋) have to write them, only certain utilities are supported so far:
* `backgroundColor`
* `borderColor`
* `boxShadow`
* `divideColor`
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

