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
