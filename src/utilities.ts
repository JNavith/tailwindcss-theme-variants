import type { SemanticUtility } from "./types";

export const backgroundColor: SemanticUtility = {
	className: ({ name }) => `bg-${name}`,
	opacityUtility: "backgroundOpacity",
	opacityVariable: "bg-opacity",
};
export const backgroundOpacity: SemanticUtility = {
	className: ({ name }) => `bg-opacity-${name}`,
	property: "--bg-opacity",
};

export const borderColor: SemanticUtility = {
	className: ({ name }) => `border-${name}`,
	opacityUtility: "borderOpacity",
	opacityVariable: "border-opacity",
};
export const borderOpacity: SemanticUtility = {
	className: ({ name }) => `border-opacity-${name}`,
	property: "--border-opacity",
};

export const boxShadow: SemanticUtility = {
	className: ({ name }) => `shadow-${name}`,
};

export const divideColor: SemanticUtility = {
	className: ({ name }) => `divide-${name}`,
	opacityUtility: "divideOpacity",
	opacityVariable: "divide-opacity",
	property: "border-color",
	selector: ({ name }) => `.divide-${name} > :not(template) ~ :not(template)`,
};
export const divideOpacity: SemanticUtility = {
	className: ({ name }) => `divide-opacity-${name}`,
	property: "--divide-opacity",
};

export const fontFamily: SemanticUtility = {
	className: ({ name }) => `font-${name}`,
};

export const fontSize: SemanticUtility = {
	className: ({ name }) => `text-${name}`,
};

export const fontWeight: SemanticUtility = {
	className: ({ name }) => `shadow-${name}`,
};

export const gradientFromColor: SemanticUtility = {
	className: ({ name }) => `from-${name}`,
	property: "--gradient-from-color",
};
export const gradientViaColor: SemanticUtility = {
	className: ({ name }) => `via-${name}`,
	property: "--gradient-via-color",
};
export const gradientToColor: SemanticUtility = {
	className: ({ name }) => `to-${name}`,
	property: "--gradient-to-color",
};

export const opacity: SemanticUtility = {
	className: ({ name }) => `opacity-${name}`,
};

export const textColor: SemanticUtility = {
	className: ({ name }) => `text-${name}`,
	opacityUtility: "textOpacity",
	opacityVariable: "text-opacity",
};
export const textOpacity: SemanticUtility = {
	className: ({ name }) => `text-opacity-${name}`,
	property: "--text-opacity",
};

export const transitionDuration: SemanticUtility = {
	className: ({ name }) => `duration-${name}`,
};
export const transitionProperty: SemanticUtility = {
	className: ({ name }) => `transition-${name}`,
};
