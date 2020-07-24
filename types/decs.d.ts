declare module "tailwindcss";

declare module "tailwindcss/plugin" {
    import { CreatePlugin } from "@navith/tailwindcss-plugin-author-types";

    const createPlugin: CreatePlugin;
    export default createPlugin;
}

declare module "jest-matcher-css";
