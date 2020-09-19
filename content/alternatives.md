# Alternatives
Both because there are many theme plugins for Tailwind CSS, and because *what's the right way to do theming?* is a frequently asked question, we've compiled this table listing every theme plugin to compare their features and ultimately answer that question:

<table>
    <thead>
        <tr>
            <th></th>
            <th><a href="https://tailwindcss.com/docs/breakpoints/#dark-mode">Native screens</a></th>
            <th><a href="https://github.com/tailwindlabs/tailwindcss/pull/2279">Experimental <code>darkModeVariant</code></a></th>
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
            <th>Classes can be <code>@apply</code>ed</th>
            <td>🟡</td>
            <td>🟡</td>
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
            <th>Requires <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/--*">custom properties</a></th>
            <td>❌</td>
            <td>❌</td>
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
            <td>✅</td>
            <td>✅</td>
        </tr>
        <tr>
            <th>Stacked variants like <code>hover</code></th>
            <td>✅</td>
            <td>✅</td>
            <td>🟡</td>
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
            <td>✅</td>
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
            <td>✅</td>
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

**[`tailwindcss-prefers-dark-mode`](https://github.com/javifm86/tailwindcss-prefers-dark-mode)** and **[experimental `darkModeVariant`](https://github.com/tailwindlabs/tailwindcss/pull/2279)**: cannot use selectors and media queries at the same time; it's one or the other, so you have to put a ✅ in one row and ❌ in the other.
