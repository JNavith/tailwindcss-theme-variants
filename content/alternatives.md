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
            <th>Stacked variants like <code>hover</code></th>
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

**Stacked variants**: While "inside" of a theme, it must be possible to "activate" classes depending on pseudoselector conditions. For instance, it has to be possible to change the text color when **both** the theme is `green` **and** the text is `:hover`ed over.

Plugins that have a 🟡 support only some of the variants in Tailwind's core, and none that come from other variant-registering plugins.

**Supports `prefers-color-scheme` or other media queries**: Because [any media query can be detected in JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), any plugin marked as not supporting [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme) could "support" it by adding or removing classes or data attributes, like the [`prefers-dark.js` script](https://github.com/ChanceArthur/tailwindcss-dark-mode/blob/master/prefers-dark.js) does. This approach still comes with the caveats that
1. JavaScriptless visitors will not have the site's theme reflect their preferred one
2. It could still be possible for a flash of unthemed content to appear before the appropriate theme is activated (unless you block rendering by executing the script immediately in `head`)
3. Your site will immediately jump between light and dark instead of smoothly transitioning with the rest of the screen on macOS

**[tailwindcss-prefers-dark-mode](https://github.com/javifm86/tailwindcss-prefers-dark-mode)** and **[built-in dark mode](https://tailwindcss.com/docs/dark-mode)**: cannot use selectors and media queries at the same time; it's one or the other, so you have to put a ✅ in one row and ❌ in the other.
