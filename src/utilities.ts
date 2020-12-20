import { kebabCase } from "lodash";

import { toRgba } from "tailwindcss/lib/util/withAlphaVariable";
import type { SemanticUtility } from "./types";

const simpleCSS = (property: string): SemanticUtility["css"] => ({ computedClass, computedValue }) => ({
	[computedClass]: {
		[property]: computedValue,
	},
});

const simpleUtility = (utility: string, prefix?: string, isColorUtility?: boolean): SemanticUtility => ({
	configKey: utility,
	isColorUtility: isColorUtility ?? false,
	prefix: prefix ?? utility,
	css: simpleCSS(kebabCase(utility)),
});

const sameColorFullyTransparent = (color: string) => {
	if (color.startsWith("var(--")) {
		return `rgba(${color}, 0)`;
	}
	const match = color.match(/^rgb\((.+)\)$/);
	if (match) {
		const variable = match[1];
		return `rgba(${variable}, 0)`;
	}
	const [r, g, b] = toRgba(color);
	return `rgba(${r}, ${g}, ${b}, 0)`;
};

export const backgroundColor: SemanticUtility = {
	configKey: "backgroundColor",
	prefix: "bg",
	isColorUtility: true,
	opacityUtility: "backgroundOpacity",
	opacityVariable: "bg-opacity",
	css: ({
		computedClass, computedValue, opacityVariable, opacityVariableUsed,
	}) => ({
		[computedClass]: {
			...opacityVariableUsed ? { [`--${opacityVariable}`]: "1" } : {},
			"background-color": computedValue,
		},
	}),
};
export const backgroundOpacity: SemanticUtility = {
	configKey: "backgroundOpacity",
	prefix: "bg-opacity",
	isColorUtility: false,
	css: simpleCSS("--bg-opacity"),
};

export const borderColor: SemanticUtility = {
	configKey: "borderColor",
	prefix: "border",
	isColorUtility: true,
	opacityUtility: "borderOpacity",
	opacityVariable: "border-opacity",
	css: ({
		computedClass, computedValue, opacityVariable, opacityVariableUsed,
	}) => ({
		[computedClass]: {
			...opacityVariableUsed ? { [`--${opacityVariable}`]: "1" } : {},
			"border-color": computedValue,
		},
	}),
};
export const borderOpacity: SemanticUtility = {
	configKey: "borderOpacity",
	prefix: "border-opacity",
	isColorUtility: false,
	css: simpleCSS("--border-opacity"),
};

export const boxShadow: SemanticUtility = {
	configKey: "boxShadow",
	prefix: "shadow",
	isColorUtility: false,
	css: ({ computedClass, computedValue, onTailwind2 }) => ({
		[computedClass]: {
			...(onTailwind2 ? {
				"--tw-shadow": computedValue,
				"box-shadow": "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
			} : { "box-shadow": computedValue }),
		},
	}),
};

export const divideColor: SemanticUtility = {
	configKey: "divideColor",
	prefix: "divide",
	isColorUtility: true,
	opacityUtility: "divideOpacity",
	opacityVariable: "divide-opacity",
	css: ({
		computedClass, computedValue, opacityVariable, opacityVariableUsed,
	}) => ({
		[`${computedClass} > :not(template) ~ :not(template)`]: {
			...opacityVariableUsed ? { [`--${opacityVariable}`]: "1" } : {},
			"border-color": computedValue,
		},
	}),
};
export const divideOpacity: SemanticUtility = {
	configKey: "divideOpacity",
	prefix: "divide-opacity",
	isColorUtility: false,
	css: ({ computedClass, computedValue }) => ({
		[`${computedClass} > :not(template) ~ :not(template)`]: {
			"--divide-opacity": computedValue,
		},
	}),
};
export const divideStyle: SemanticUtility = {
	configKey: "divideStyle",
	prefix: "divide",
	isColorUtility: false,
	css: ({ computedClass, computedValue }) => ({
		[`${computedClass} > :not(template) ~ :not(template)`]: {
			"border-style": computedValue,
		},
	}),
};

export const fontFamily = simpleUtility("fontFamily", "font");
export const fontSize = simpleUtility("fontSize", "text");
export const fontWeight = simpleUtility("fontWeight", "font");

export const gradientFromColor: SemanticUtility = {
	configKey: "gradientColorStops",
	prefix: "from",
	isColorUtility: true,
	css: ({ computedClass, computedValue, onTailwind2 }) => ({
		[computedClass]: {
			[onTailwind2 ? "--tw-gradient-from" : "--gradient-from-color"]: computedValue,
			...(onTailwind2 ? {
				"--tw-gradient-stops": `var(--tw-gradient-from), var(--tw-gradient-to, ${sameColorFullyTransparent(computedValue)})`,
			} : {
				"--gradient-color-stops": `var(--gradient-from-color), var(--gradient-to-color, ${sameColorFullyTransparent(computedValue)})`,
			}),
		},
	}),
};
export const gradientViaColor: SemanticUtility = {
	configKey: "gradientColorStops",
	prefix: "via",
	isColorUtility: true,
	css: ({ computedClass, computedValue, onTailwind2 }) => ({
		[computedClass]: {
			...(onTailwind2 ? {
				"--tw-gradient-stops": `var(--tw-gradient-from), ${computedValue}, var(--tw-gradient-to, ${sameColorFullyTransparent(computedValue)})`,
			} : {
				"--gradient-via-color": computedValue,
				"--gradient-color-stops": `var(--gradient-from-color), var(--gradient-via-color), var(--gradient-to-color, ${sameColorFullyTransparent(computedValue)})`,
			}),
		},
	}),
};
export const gradientToColor: SemanticUtility = {
	configKey: "gradientColorStops",
	prefix: "to",
	isColorUtility: true,
	css: ({ computedClass, computedValue, onTailwind2 }) => ({
		[computedClass]: {
			...(onTailwind2 ? {
				"--tw-gradient-to": computedValue,
			} : {
				"--gradient-to-color": computedValue,
			}),
		},
	}),
};

export const opacity = simpleUtility("opacity");

export const textColor: SemanticUtility = {
	configKey: "textColor",
	prefix: "text",
	isColorUtility: true,
	opacityUtility: "textOpacity",
	opacityVariable: "text-opacity",
	css: ({
		computedClass, computedValue, opacityVariable, opacityVariableUsed,
	}) => ({
		[computedClass]: {
			...opacityVariableUsed ? { [`--${opacityVariable}`]: "1" } : {},
			color: computedValue,
		},
	}),
};
export const textOpacity: SemanticUtility = {
	configKey: "textOpacity",
	prefix: "text-opacity",
	isColorUtility: false,
	css: simpleCSS("--text-opacity"),
};

export const transitionDuration = simpleUtility("transitionDuration", "duration");
export const transitionProperty = simpleUtility("transitionProperty", "transition");
export const transitionTimingFunction = simpleUtility("transitionTimingFunction", "ease");
