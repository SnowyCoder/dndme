import {EditMapPhase} from "./editMapPhase";
import {ClientNetworkSystem, HostNetworkSystem} from "../../ecs/systems/networkSystem";
import {FlagEcsStorage} from "../../ecs/storage";
import {ClientDungeonBackgroundSystem} from "../../ecs/systems/dungeonBackgroundSystem";

export class ClientEditMapPhase extends EditMapPhase {
    networkSystem: ClientNetworkSystem;
    roomBackgroundSystem: ClientDungeonBackgroundSystem;

    constructor(id: string) {
        super('editClient', false);

        this.setupEcs();
        this.networkManager.connectTo(id);
    }

    setupEcs() {
        super.setupEcs();
        this.ecs.addStorage(new FlagEcsStorage("host_hidden"));

        this.networkSystem = new ClientNetworkSystem(this.ecs, this.networkManager.channel);
        this.roomBackgroundSystem = new ClientDungeonBackgroundSystem(this, this.networkManager.channel);
    }

    enable() {
        super.enable();

        this.roomBackgroundSystem.enable();
    }

    disable() {
        super.disable();

        this.networkSystem.destroy();
        this.roomBackgroundSystem.destroy();
    }
}