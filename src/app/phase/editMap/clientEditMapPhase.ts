import {EditMapPhase} from "./editMapPhase";
import {ClientNetworkSystem} from "../../ecs/systems/networkSystem";

export class ClientEditMapPhase extends EditMapPhase {
    constructor(id: string) {
        super('editClient', false);

        this.networkManager.connectTo(id);
    }

    registerSystems() {
        this.world.addSystem(new ClientNetworkSystem(this.world, this.networkManager.channel));
        super.registerSystems();
    }
}