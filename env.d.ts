/// <reference  types="vite/client" />

declare var __COMMIT_HASH__: string;

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<Record<string,unknown>, Record<string,unknown>, unknown>
    export default component
}
