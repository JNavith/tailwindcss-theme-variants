/*
	Tailwind - The Utility-First CSS Framework
	A project by Adam Wathan (@adamwathan), Jonathan Reinink (@reinink),
	David Hemphill (@davidhemphill) and Steve Schoger (@steveschoger).
	View the full documentation at https://tailwindcss.com.
*/

const htmlTags = require("html-tags");
const leadingTrim = require("tailwindcss-leading-trim");
const { themeVariants, prefersDark, prefersLight } = require("tailwindcss-theme-variants");
const typography = require("@tailwindcss/typography");
const typographyStyles = require("@tailwindcss/typography/src/styles");

/** @type{import("@navith/tailwindcss-plugin-author-types").TailwindCSSConfig} */
const tailwindcssConfig = {
	purge: {
		content: ["./src/**/*.svelte", "./src/**/*.html"],
		options: {
			defaultExtractor: (content) => [...content.matchAll(/(?:class:)*([\w\d-/:%.]+)/gm)].map(([_match, group, ..._rest]) => group),
			keyframes: true,
			whitelist: ["data-theme", ...htmlTags],
		},
	},
	theme: {
		extend: {
			boxShadow: {
				"lg-faint": "0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
			},
		},
		screens: {
			"sm": "640px",
			"md": "768px",
			"lg": "1024px",
			"xl": "1280px",		
			"2xl": "1920px",	
		},
		typography: {
			default: {
				css: {
					color: false,
					"@apply text-on-primary": "",
					"@apply transition-theme": "",
					width: "72ch",
					maxWidth: "100%",
					lineHeight: "2",

					"a": {
						color: false,
						textDecoration: false,
						"@apply text-accent": "",
						"@apply transition-theme": "",
					},
					"a:hover, a:focus": {
						textDecoration: "underline",
						"@apply text-accent-strong-100": "",
					},

					// Begin code styles
					"code": {
						color: "inherit",
						fontWeight: false,
						"@apply bg-primary-faint-100": "",
						"@apply transition-theme": "",
						"@apply p-1 -m-0.5 rounded": "",
						boxDecorationBreak: "clone",
					},
					"code::before": {
						content: false,
					},
					"code::after": {
						content: false,
					},
					"code a, a code": {
						"@apply text-accent-strong-100 bg-accent-faint-600": "",
					},
					"a:hover code, a:focus code": {
						"@apply text-accent-strong-200 bg-accent-faint-500": "",
					},
					"pre code, table code": {
						backgroundColor: "transparent !important",
					},
					// End code styles
					
					"h1": {
						color: false,
						"@apply text-on-primary": "",
						"@apply transition-theme": "",
						
						marginTop: typographyStyles.default.css[1].h2.marginTop,
						marginBottom: typographyStyles.default.css[1].h1.marginTop,
						
						fontWeight: false,
						"@apply font-semibold": "",
					},
					"h2": {
						color: false,
						"@apply text-on-primary": "",
						"@apply transition-theme": "",

						marginTop: typographyStyles.default.css[1].h1.marginBottom,
						
						fontWeight: false,
						"@apply font-semibold": "",
					},
					"h3": {
						color: false,
						"@apply text-on-primary": "",
						"@apply transition-theme": "",
					},

					// Begin list styles
					"li": {
						marginTop: "0.25em",
						marginBottom: "0.25em",
					},
					"ul > li > :first-child": {
						marginTop: false,
					},
					"ul > li > :last-child": {
						marginBottom: false,
					},
					"ul > li::before": {
						backgroundColor: false,
						"@apply bg-on-primary-faint-500": "",
						"@apply transition-theme": "",
						top: "0.875em",
					},
					"ol > li::before": {
						backgroundColor: false,
						"@apply text-on-primary-faint-300": "",
						"@apply transition-theme": "",
					},
					// End list styles

					"strong": {
						color: false,
						"@apply text-on-primary": "",
						"@apply transition-theme": "",
					},

					// Begin table styles
					"table": {
						"@apply block": "",
						maxHeight: "calc(40vh + 10rem)",
						"@apply overflow-x-auto overflow-y-auto": "",
						"@apply rounded-md": "",
					},

					"thead": {
						borderBottomWidth: false,
					},

					"thead:first-child tr:first-child th:first-child, tbody:first-child tr:first-child th:first-child, tbody:first-child tr:first-child td:first-child": {
						"@apply rounded-tl-md": "",
					},
					"thead:first-child tr:first-child th:last-child, tbody:first-child tr:first-child th:last-child, tbody:first-child tr:first-child td:last-child": {
						"@apply rounded-tr-md": "",
					},
					"thead:last-child tr:last-child th:last-child, tbody:last-child tr:last-child th:last-child, tbody:last-child tr:last-child td:last-child": {
						"@apply rounded-br-md": "",
					},
					"thead:last-child tr:last-child th:first-child, tbody:last-child tr:last-child th:first-child, tbody:last-child tr:last-child td:first-child": {
						"@apply rounded-bl-md": "",
					},

					"tbody tr": {
						borderBottomWidth: false,
					},

					"thead th:first-child:empty": {
						"@apply z-10": "",
					},
					
					"tbody th:first-child, thead th": {
						"@apply sticky top-0 left-0": "",
						"@apply bg-primary-faint-100": "",
					},

					"thead th:first-child": {
						paddingLeft: false,
					},
					"thead th:last-child": {
						paddingRight: false,
					},

					"tbody td:first-child": {
						paddingLeft: false,
					},
					"tbody td:last-child": {
						paddingRight: false,
					},

					"th": {
						"@apply font-semibold": "",
					},

					"th, td": {
						"@apply p-2": "",
						"@apply bg-primary-faint-100": "",
						"@apply transition-theme": "",
					},

					"tbody tr:nth-child(odd) th, tbody tr:nth-child(odd) td": {
						"@apply bg-primary-faint-200": "",
					},
					// End table styles

					// Header links
					"[id]": {
						position: "relative",
					},
					"[id]:hover, [id]:focus": {
						textDecoration: "underline",
					},
					"[id]:hover a::before, [id]:target a::before": {
						content: '"🔗"',
						position: "absolute",
						left: "0",
						right: "0",
						transform: "translate(-3ch, 50%)",
						fontSize: "0.5em",
					}
				},
			},
			
			sm: {
				css: {
					lineHeight: "2.5",

					// Begin heading styles
					"h1": {
						marginTop: typographyStyles.sm.css[0].h2.marginTop,
						marginBottom: typographyStyles.sm.css[0].h1.marginTop,
					},
					"h2": {
						marginTop: typographyStyles.sm.css[0].h1.marginBottom,
					},
					// End heading styles

					// Begin list styles
					"ul > li::before": {
						top: "1em",
					},
					// End list styles

					// Begin table styles
					"thead th:first-child": {
						paddingLeft: false,
					},
					"thead th:last-child": {
						paddingRight: false,
					},

					"tbody td:first-child": {
						paddingLeft: false,
					},
					"tbody td:last-child": {
						paddingRight: false,
					},
					// End table styles
				}
			},

			lg: {
				css: {
					// Begin table styles
					"table": {
						maxHeight: "calc(80vh - 8rem)",
					},
					// End table styles
				},
			}
		},
	},
	variants: {
		backgroundColor: ["group-hocus", "hocus", "themes"],
		borderColor: ["themes"],
		boxShadow: ["themes"],
		divideColor: ["themes"],
		textDecoration: ["group-hocus", "hocus"],
		textColor: ["group-hocus", "hocus", "themes"],
	},
	plugins: [
		themeVariants({
			group: "themes",
			baseSelector: "html",
			fallback: "compact",
			themes: {
				"light-theme": {
					selector: "[data-theme=light]",
					mediaQuery: prefersLight,
					semantics: {
						colors: {
							"accent-faint-600": "blue-100",
							"accent-faint-500": "blue-200",
							"accent-faint-400": "blue-300",
							"accent-faint-300": "blue-400",
							"accent-faint-200": "blue-500",
							"accent-faint-100": "blue-600",
							"accent": "blue-700",
							"accent-strong-100": "blue-800",
							"accent-strong-200": "blue-900",

							"primary-faint-200": "gray-200",
							"primary-faint-100": "gray-100",
							"primary": "white",

							"on-primary": "gray-800",
							"on-primary-faint-100": "gray-700",
							"on-primary-faint-200": "gray-600",
							"on-primary-faint-300": "gray-500",
							"on-primary-faint-500": "gray-300",

							"header": "white",
						},
						boxShadow: {
							"header": "lg-faint",
						},
					},
				},
				"dark-theme": {
					selector: "[data-theme=dark]",
					mediaQuery: prefersDark,
					semantics: {
						colors: {
							"accent-faint-600": "blue-900",
							"accent-faint-500": "blue-800",
							"accent": "blue-400",
							"accent-strong-100": "blue-200",
							"accent-strong-200": "blue-100",

							"primary-faint-200": "gray-700",
							"primary-faint-100": "gray-800",
							"primary": "gray-900",

							"on-primary": "gray-100",
							"on-primary-faint-100": "gray-200",
							"on-primary-faint-200": "gray-300",
							"on-primary-faint-300": "gray-400",
							"on-primary-faint-400": "gray-500",
							"on-primary-faint-500": "gray-600",

							"header": "gray-800",
						},
						boxShadow: {
							"header": "lg",
						},
					},
				},
			},
		}),

		typography,
		
		leadingTrim,

		({ addVariant, e }) => {
			addVariant("hocus", ({ modifySelectors, separator }) => {
				modifySelectors(({ className }) => {
					const utilityClass = e(`hocus${separator}${className}`);
					return `.${utilityClass}:hover, .${utilityClass}:focus`;
				});
			});
			addVariant("group-hocus", ({ modifySelectors, separator }) => {
				modifySelectors(({ className }) => {
					const utilityClass = e(`group-hocus${separator}${className}`);
					return `.group:hover .${utilityClass}, .group:focus .${utilityClass}`;
				});
			});
		},
	],

	target: ["relaxed", {
		// Semantic variables are not fully implemented yet, so leaving them enabled breaks things
		themeVariants: "ie11",
	}],

	experimental: {
		applyComplexClasses: true,
		extendedSpacingScale: true,
		uniformColorPalette: true,
	},

	future: {
		removeDeprecatedGapUtilities: true,
		purgeLayersByDefault: true,
	},
};

module.exports = tailwindcssConfig;
