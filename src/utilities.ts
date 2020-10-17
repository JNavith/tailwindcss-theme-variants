import { kebabCase } from "lodash";

import { toRgba } from "tailwindcss/lib/util/withAlphaVariable";
import type { SemanticUtility } from "./types";

const simpleCSS = (property: string): SemanticUtility["css"] => ({ computedClass, computedValue }) => ({
	[computedClass]: {
		[property]: computedValue,
	},
});

const simpleUtility = (utility: string, prefix?: string): SemanticUtility => ({
	configKey: utility,
	prefix: prefix ?? utility,
	css: simpleCSS(kebabCase(utility)),
});

const sameColorFullyTransparent = (color: string) => {
	const [r, g, b] = toRgba(color);
	return `rgba(${r}, ${g}, ${b}, 0)`;
};

export const backgroundColor: SemanticUtility = {
	configKey: "backgroundColor",
	prefix: "bg",
	opacityUtility: "backgroundOpacity",
	opacityVariable: "bg-opacity",
	css: simpleCSS("background-color"),
};
export const backgroundOpacity: SemanticUtility = {
	configKey: "backgroundOpacity",
	prefix: "bg-opacity",
	css: simpleCSS("--bg-opacity"),
};

export const borderColor: SemanticUtility = {
	configKey: "borderColor",
	prefix: "border",
	opacityUtility: "borderOpacity",
	opacityVariable: "border-opacity",
	css: simpleCSS("border-color"),
};
export const borderOpacity: SemanticUtility = {
	configKey: "borderOpacity",
	prefix: "border-opacity",
	css: simpleCSS("--border-opacity"),
};

export const boxShadow = simpleUtility("boxShadow", "shadow");

export const divideColor: SemanticUtility = {
	configKey: "divideColor",
	prefix: "divide",
	opacityUtility: "divideOpacity",
	opacityVariable: "divide-opacity",
	css: ({ computedClass, computedValue }) => ({
		[`${computedClass} > :not(template) ~ :not(template)`]: {
			"border-color": computedValue,
		},
	}),
};
export const divideOpacity: SemanticUtility = {
	configKey: "divideOpacity",
	prefix: "divide-opacity",
	css: ({ computedClass, computedValue }) => ({
		[`${computedClass} > :not(template) ~ :not(template)`]: {
			"--divide-opacity": computedValue,
		},
	}),
};
export const divideStyle: SemanticUtility = {
	configKey: "divideStyle",
	prefix: "divide",
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
	css: ({ computedClass, computedValue }) => ({
		[computedClass]: {
			"--gradient-from-color": computedValue,
			"--gradient-color-stops": `var(--gradient-from-color), var(--gradient-to-color, ${sameColorFullyTransparent(computedValue)})`,
		},
	}),
};
export const gradientViaColor: SemanticUtility = {
	configKey: "gradientColorStops",
	prefix: "via",
	css: ({ computedClass, computedValue }) => ({
		[computedClass]: {
			"--gradient-via-color": computedValue,
			"--gradient-color-stops": `var(--gradient-from-color), var(--gradient-via-color), var(--gradient-to-color, ${sameColorFullyTransparent(computedValue)})`,
		},
	}),
};
export const gradientToColor: SemanticUtility = {
	configKey: "gradientColorStops",
	prefix: "to",
	css: simpleCSS("--gradient-to-color"),
};

export const opacity = simpleUtility("opacity");

export const textColor: SemanticUtility = {
	configKey: "textColor",
	prefix: "text",
	opacityUtility: "textOpacity",
	opacityVariable: "text-opacity",
	css: simpleCSS("color"),
};
export const textOpacity: SemanticUtility = {
	configKey: "textOpacity",
	prefix: "text-opacity",
	css: simpleCSS("--text-opacity"),
};

export const transitionDuration = simpleUtility("transitionDuration", "duration");
export const transitionProperty = simpleUtility("transitionProperty", "transition");
export const transitionTimingFunction = simpleUtility("transitionTimingFunction", "ease");
