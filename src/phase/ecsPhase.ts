import {Phase} from "./phase";
import {World} from "../ecs/World";
import {registerCommonStorage} from "../ecs/component";

export class EcsPhase extends Phase {
    readonly world: World;

    constructor(name: string, isMaster: boolean) {
        super(name);
        this.world = new World(isMaster);
    }

    ecsSetup(): void {
        registerCommonStorage(this.world);
        this.registerSystems();
        this.world.populate();
    }

    registerSystems(): void {
    }

    enable() {
        this.ecsSetup();
        super.enable();
        this.world.enable();
    }

    disable() {
        super.disable();
        this.world.destroy();
    }
}
