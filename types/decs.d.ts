declare module "tailwindcss";

declare module "tailwindcss/plugin" {
    import { CreatePlugin } from "src/types"; // eslint-disable-line import/no-unresolved

    const createPlugin: CreatePlugin;
    export default createPlugin;
}

declare module "jest-matcher-css";
