// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { parseColor } from "tailwindcss/lib/util/color";

export const colorToRgb = (color: string): string => {
	const parsed = parseColor(color);

	if (parsed) {
		if (parsed.mode === "rgb") return parsed.color.join(", ");
	}

	const insideRgbMatch = color.match(/rgb\((.+)\)/);
	if (insideRgbMatch) return insideRgbMatch[1];

	throw new Error(`tailwindcss-theme-variants: \`${color}\` is not recognized as a color`);
};

export const rgbToThemeValue = (rgb: string) => ({ opacityValue, opacityVariable }: { opacityValue?: string, opacityVariable?: string }): string => {
	if (opacityValue !== undefined) {
		return `rgba(${rgb}, ${opacityValue})`;
	}
	if (opacityVariable !== undefined) {
		return `rgba(${rgb}, var(${opacityVariable}, 1))`;
	}
	return `rgb(${rgb})`;
};
