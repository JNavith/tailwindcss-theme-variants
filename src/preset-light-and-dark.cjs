import { themeVariants, prefersDark, prefersLight } from ".";

module.exports = {
	variants: {
		backgroundColor: ({ after }) => after(["themes", "themes:group-hover", "themes:focus-within", "themes:hover", "themes:focus"]),
		borderColor: ({ after }) => after(["themes", "themes:group-hover", "themes:focus-within", "themes:hover", "themes:focus"]),
		boxShadow: ({ after }) => after(["themes", "themes:group-hover", "themes:focus-within", "themes:hover", "themes:focus"]),
		gradientColorStops: ({ after }) => after(["themes", "themes:hover", "themes:focus"]),
		divideColor: ({ after }) => after(["themes"]),
		textColor: ({ after }) => after(["themes", "themes:group-hover", "themes:focus-within", "themes:hover", "themes:focus", "themes:placeholder"]),
	},
	plugins: [
		themeVariants({
			group: "themes",
			fallback: "compact",
			baseSelector: "html",
			themes: {
				light: {
					mediaQuery: prefersLight,
					selector: "[data-theme=light]",
					semantics: {
						colors: {
							primary: {
								faint: {
									200: "gray-200",
									100: "gray-100",
									DEFAULT: "gray-100",
								},
								DEFAULT: "white",
							},

							"on-primary": {
								faint: {
									500: "gray-300",
									400: "gray-400",
									300: "gray-500",
									200: "gray-600",
									100: "gray-700",
									DEFAULT: "gray-700",
								},
								DEFAULT: "gray-800",
							},

							error: "red-100",
							"on-error": "red-900",

							warning: "yellow-100",
							"on-warning": "yellow-900",

							sucess: "green-100",
							"on-sucess": "green-900",

							// Teal is not part of the default color palette anymore
							info: "blue-100",
							"on-info": "blue-900",
						},
					},
				},

				dark: {
					mediaQuery: prefersDark,
					selector: "[data-theme=dark]",
					semantics: {
						colors: {
							primary: {
								faint: {
									200: "gray-700",
									100: "gray-800",
								},
								default: "gray-900",
							},

							"on-primary": {
								faint: {
									500: "gray-600",
									400: "gray-500",
									300: "gray-400",
									200: "gray-300",
									100: "gray-200",
								},
								default: "gray-100",
							},

							error: "red-800",
							"on-error": "white",

							warning: "yellow-800",
							"on-warning": "white",

							sucess: "green-800",
							"on-sucess": "white",

							// Teal is not part of the default color palette anymore
							info: "blue-800",
							"on-info": "white",
						},
					},
				},
			},
		}),
	],
};
