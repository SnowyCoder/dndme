export interface System {
    readonly name: string;
    readonly dependencies: Array<string>;
    readonly optionalDependencies?: Array<string>;
    readonly provides?: Array<string>;

    enable(): void;
    destroy(): void;
}

