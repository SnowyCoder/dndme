
declare module "*.vue" {
    import Vue from "vue";
    export default Vue;
}

declare module "*.png" {
    const value: any;
    export default value;
}

declare module "*.jpg" {
    const value: any;
    export default value;
}

declare module "*.json" {
    const value: any;
    export default value;
}

declare module "*.ttf" {
    const value: any;
    export default value;
}

declare var __COMMIT_HASH__: string;

/*
declare const process : {
    env: {
        VERBOSE_CHANNEL: boolean;

        WS_URL: string;
    }
};
*/
