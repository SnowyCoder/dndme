import {EditMapPhase} from "./editMapPhase";
import {ClientNetworkSystem} from "../../ecs/systems/networkSystem";
import {FlagEcsStorage} from "../../ecs/storage";

export class ClientEditMapPhase extends EditMapPhase {
    networkSystem: ClientNetworkSystem;

    constructor(id: string) {
        super('editClient', false);

        this.setupEcs();
        this.networkManager.connectTo(id);
    }

    setupEcs() {
        super.setupEcs();
        this.ecs.addStorage(new FlagEcsStorage("host_hidden", false, true));

        this.networkSystem = new ClientNetworkSystem(this.ecs, this.networkManager.channel);
    }

    enable() {
        super.enable();
    }

    disable() {
        super.disable();

        this.networkSystem.destroy();
    }
}