export const backgroundColor = {
	className: ({ name }: { name: string }): string => `bg-${name}`,
	opacityUtility: "backgroundOpacity",
};
export const borderColor = {
	className: ({ name }: { name: string }): string => `border-${name}`,
	opacityUtility: "borderOpacity",
};
export const divideColor = {
	className: ({ name }: { name: string }): string => `divide-${name}`,
	opacityUtility: "divideOpacity",
};
export const textColor = {
	className: ({ name }: { name: string }): string => `text-${name}`,
	opacityUtility: "textOpacity",
};
