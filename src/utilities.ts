import { kebabCase } from "lodash";

import type { SemanticUtility } from "./types";

const simpleCSS = (property: string): SemanticUtility["css"] => ({ computedClass, computedValue }) => ({
	[computedClass]: {
		[property]: computedValue,
	},
});

const simpleUtility = (utility: string, prefix?: string): SemanticUtility => ({
	prefix: prefix ?? utility,
	css: simpleCSS(kebabCase(utility)),
});

// TODO: "#ff0" -> "rgba(255, 255, 0, 0)"
const sameColorFullyTransparent = (color: string) => "rgba(0, 0, 0, 0)";

export const backgroundColor: SemanticUtility = {
	prefix: "bg",
	opacityUtility: "backgroundOpacity",
	opacityVariable: "bg-opacity",
	css: simpleCSS("background-color"),
};
export const backgroundOpacity: SemanticUtility = {
	prefix: "bg-opacity",
	css: simpleCSS("--bg-opacity"),
};

export const borderColor: SemanticUtility = {
	prefix: "border",
	opacityUtility: "borderOpacity",
	opacityVariable: "border-opacity",
	css: simpleCSS("border-color"),
};
export const borderOpacity: SemanticUtility = {
	prefix: "border-opacity",
	css: simpleCSS("--border-opacity"),
};

export const boxShadow = simpleUtility("boxShadow", "shadow");

export const divideColor: SemanticUtility = {
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
	prefix: "divide-opacity",
	css: ({ computedClass, computedValue }) => ({
		[`${computedClass} > :not(template) ~ :not(template)`]: {
			"--divide-opacity": computedValue,
		},
	}),
};
export const divideStyle: SemanticUtility = {
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
	prefix: "from",
	css: ({ computedClass, computedValue }) => ({
		[computedClass]: {
			"--gradient-from-color": computedValue,
			"--gradient-color-stops": `var(--gradient-from-color), var(--gradient-to-color, ${sameColorFullyTransparent(computedValue)})`,
		},
	}),
};
export const gradientViaColor: SemanticUtility = {
	prefix: "via",
	css: ({ computedClass, computedValue }) => ({
		[computedClass]: {
			"--gradient-via-color": computedValue,
			"--gradient-color-stops": `var(--gradient-from-color), var(--gradient-via-color), var(--gradient-to-color, ${sameColorFullyTransparent(computedValue)})`,
		},
	}),
};
export const gradientToColor: SemanticUtility = {
	prefix: "to",
	css: simpleCSS("--gradient-to-color"),
};

export const opacity = simpleUtility("opacity");

export const textColor: SemanticUtility = {
	prefix: "text",
	opacityUtility: "textOpacity",
	opacityVariable: "text-opacity",
	css: simpleCSS("color"),
};
export const textOpacity: SemanticUtility = {
	prefix: "text-opacity",
	css: simpleCSS("--text-opacity"),
};

export const transitionDuration = simpleUtility("transitionDuration", "duration");
export const transitionProperty = simpleUtility("transitionProperty", "transition");
export const transitionTimingFunction = simpleUtility("transitionTimingFunction", "ease");
