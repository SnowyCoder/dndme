import {System} from "./System";
import { RegisteredSystem, SystemForName, SystemName } from "./TypeRegistry";

export class SystemGraph {
    private systemsByName = new Map<string, System>();
    private systems = new Array<System>();
    private unfulfilledDeps = new Set<string>();

    get<N extends SystemName>(name: N): SystemForName<N> | undefined {
        return this.systemsByName.get(name) as SystemForName<N>;
    }

    register(system_: RegisteredSystem): void {
        const system = system_ as System;
        let depName = system.name;
        let unfulfilled = this.unfulfilledDeps.has(system.name);

        if (!unfulfilled && system.provides !== undefined) {
            for (let dep of system.provides) {
                depName = dep;
                unfulfilled = this.unfulfilledDeps.has(dep);
                if (unfulfilled) break;
            }
        }
        if (unfulfilled) {
            throw new Error(`Some previous system optionally depended on ${depName}, please order your systems correctly`);
        }

        for (let dep of system.dependencies) {
            if (!this.systemsByName.has(dep)) throw new Error('Unfulfilled dependency: ' + dep);
        }
        if (system.optionalDependencies !== undefined) {
            for (let dep of system.optionalDependencies) {
                if (this.systemsByName.has(dep)) continue;
                this.unfulfilledDeps.add(dep);
            }
        }

        let sys = this.systemsByName.get(system.name);
        if (sys != null) {
            if (sys.name === system.name) throw new Error('System name conflict');
            console.warn(`System ${system.name} has been already registered under ${sys.name}, overriding`);
        }
        this.systemsByName.set(system.name, system);
        this.systems.push(system);
        if (system.provides) {
            for (let prov of system.provides) {
                if (this.systemsByName.has(prov)) {
                    throw new Error(`Service ${prov} is already provided by ${this.systemsByName.get(prov)!.name}, cannot override with ${system.name}`);
                }
                this.systemsByName.set(prov, system);
            }
        }
    }

    [Symbol.iterator](): IterableIterator<System> {
        return this.systems[Symbol.iterator]();
    }

    getAt(index: number): System {
        return this.systems[index];
    }

    size(): number {
        return this.systems.length;
    }
}
