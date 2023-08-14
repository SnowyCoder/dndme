import { Component } from "./component";
import { Resource } from "./resource";

// ~~~~~~~~ Guide to creating a new System ~~~~~~~~
// 1. Implement the System interface
// 2. Override name with a custom name
//      also export const NAME_TYPE and type NAME_TYPE for ease of use.
// 3. Override dependencies/optionalDeps/provides if necessary
// 4. Register created components by overriding components/resources (DO NOT INSTANTIATE THEM)
// 5. Add the system in TypeRegistry's list.
// 6. Add the system in @/phase/editMap/editMapPhase.ts (or it won't be loaded)
//
// EXTRA NOTES:
// - In general it's always easier to begin by copying a similar system
// - This is NOT a normal ECS architecture, (there is no tick method)
//   You will need to subscribe to events and react to them.
// - If you need to react to a component/resource modification (lik 99% of systems)
//   PLEASE USE DeclarativeListenerSystem.
//   It's new shiny dndme tech and it prevents overpopulation of 'component_edit' & similar events
//   see its file for details

export interface System {
    readonly name: string;
    // Systems that need to be loaded before this one
    readonly dependencies: Array<string>;
    // Systems that need to be loaded before this one (if present)
    readonly optionalDependencies?: Array<string>;
    // Abstract systems that this system implements.
    readonly provides?: Array<string>;

    // TYPE-registry helpers.
    // These should NEVER be instantiated, but they serve as a helping hand with the Typization.
    // Systems should provide the components/resources they create like this:
    //   components?: [MyComponent1, MyComponent2];
    //   resources?: [MyResource];
    // When the new system is inserted into the TypeRegistry these components will be added to the
    // RegisteredComponent/RegisteredResource types, and TypeSense will help a lot in development.
    readonly components?: readonly Component[];
    readonly resources?: readonly Resource[];

    enable(): void;
    destroy(): void;
}
