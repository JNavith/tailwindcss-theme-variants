declare module "tailwindcss";
declare module "tailwindcss/lib/util/withAlphaVariable" {
	const withAlphaVariable: ({ color, property, variable }: { color: string, property: string, variable: string }) => string;
	export default withAlphaVariable;
	export const toRgba: (color: string) => [number, number, number, number];
}
