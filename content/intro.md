**This Tailwind CSS plugin registers variants for theming beyond just light and dark modes *without needing custom properties***. It has support for 
* Controlling themes with 
  * **Media queries**, like [`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), `print`, or anything you want
  * **CSS selectors**, like classes and data attributes
  * Or both at the same time!
* **Responsive** variants
* **Stacking** on extra **variants**, like `hover` so you can change a link's hover color depending on the theme
* **Falling back** to a certain theme when no other one could become active, like if a visitor's browser doesn't support JavaScript or the new `prefers-` media queries
* **As many themes as you want**: light theme, dark theme, red theme, blue theme—just bring your own definitions! A future feature called "semantics" will make multiple themes even easier to work with!

You are recommended to check out [the comparison table of all Tailwind CSS theming plugins below](#alternatives) before committing to any one. By the way, you might have noticed this plugin's documentation / `README` is *very* long—don't let that frighten you! I designed it to be *overdocumented* and as exhaustive as possible, and since most of it is long code snippets, it's shorter than it looks *and* you don't need to go through it all to do well!

However, if you want your site to have a very large number of themes (say, 4 or more) or potentially infinite themes (such as could be configured by your users), then **this plugin is not for you** (until the "semantics" feature is implemented). You will probably be better off using a custom properties setup; refer back to [that table 👇](#alternatives).

## What about Tailwind's upcoming official dark mode?
**This plugin will still be maintained!** Light and dark mode support is just *one* thing this plugin can do, and the complexity this plugin can provide [will not be reflected in Tailwind core (see Design Rationale)](https://github.com/tailwindlabs/tailwindcss/pull/2279), so I will still need this around.
