// eslint-disable-next-line import/no-unresolved
import { toRgba } from "tailwindcss/lib/util/withAlphaVariable";
import type { SemanticUtility } from "./types";

const simpleUtility = (utility: string, prefix?: string, isColorUtility?: boolean): SemanticUtility => ({
	configKey: utility,
	prefix: prefix ?? utility,
	disassemble: isColorUtility ? (color: string) => { const [r, g, b] = toRgba(color); return `${r}, ${g}, ${b}`; } : (value: string) => value,
	reassemble: isColorUtility ? (value: string) => ({ opacityValue, opacityVariable }) => {
		if (opacityValue !== undefined) {
			return `rgba(${value}, ${opacityValue})`;
		}
		if (opacityVariable !== undefined) {
			return `rgba(${value}, var(${opacityVariable}, 1))`;
		}
		return `rgb(${value})`;
	} : (value: string) => value,
});

export const backgroundColor = simpleUtility("backgroundColor", "bg", true);
export const backgroundOpacity = simpleUtility("backgroundOpacity", "bg");

export const borderColor = simpleUtility("borderColor", "border", true);
export const borderOpacity = simpleUtility("borderOpacity", "border");
export const borderStyle = simpleUtility("borderStyle", "border");

export const boxShadow = simpleUtility("boxShadow", "shadow");

// Forgive this awful hack
export const colors = simpleUtility("", "", true);

export const divideColor = simpleUtility("divideColor", "divide", true);
export const divideOpacity = simpleUtility("divideOpacity", "divide");
export const divideStyle = simpleUtility("divideStyle", "divide");

export const fontFamily: SemanticUtility = {
	configKey: "fontFamily",
	disassemble: (fontList: string[]) => (Array.isArray(fontList) ? fontList.join(",") : fontList),
	prefix: "font",
	reassemble: (value: string) => value,
};
export const fontSize = simpleUtility("fontSize", "text");
export const fontWeight = simpleUtility("fontWeight", "font");

export const gradientFromColor = simpleUtility("gradientColorStops", "from", true);
export const gradientViaColor = simpleUtility("gradientColorStops", "via", true);
export const gradientToColor = simpleUtility("gradientColorStops", "to", true);

export const opacity = simpleUtility("opacity");

export const textColor = simpleUtility("textColor", "text", true);
export const textOpacity = simpleUtility("textOpacity", "text");

export const transitionDuration = simpleUtility("transitionDuration", "duration");
export const transitionProperty = simpleUtility("transitionProperty", "transition");
export const transitionTimingFunction = simpleUtility("transitionTimingFunction", "ease");
