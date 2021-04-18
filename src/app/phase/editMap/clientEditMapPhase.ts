import {EditMapPhase} from "./editMapPhase";

export class ClientEditMapPhase extends EditMapPhase {
    constructor(id: string) {
        super('editClient', false);

        this.networkManager.connectTo(id);
    }
}