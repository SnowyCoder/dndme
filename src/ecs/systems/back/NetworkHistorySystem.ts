

// This system links together the changes in the window.location.hash and
// the appropriate resource in the ECS system.

import { System } from "@/ecs/System";
import { DISCOVERY_CONFIG_TYPE, DiscoveryConfigResource, NETWORK_STATUS_TYPE, NETWORK_TYPE } from "./NetworkSystem";
import { World } from "@/ecs/World";
import { Resource } from "@/ecs/resource";
import { resetPhase } from "@/secondPhase";
import { Logger } from "./log/Logger";
import { getLogger } from "./log/LogSystem";
import { DECLARATIVE_LISTENER_TYPE } from "./DeclarativeListenerSystem";


export const NETWORK_HISTORY_TYPE = 'network_history';
export type NETWORK_HISTORY_TYPE = typeof NETWORK_HISTORY_TYPE;

export class NetworkHistorySystem implements System {
    readonly name = NETWORK_HISTORY_TYPE;
    readonly dependencies = [NETWORK_TYPE, DECLARATIVE_LISTENER_TYPE];

    readonly world: World;
    private readonly logger: Logger;

    private hashChangeListener: any;
    private latestRoom: string = "";

    constructor(world: World) {
        this.world = world;
        this.logger = getLogger(world, 'network.history');

        const decl = this.world.requireSystem(DECLARATIVE_LISTENER_TYPE);

        decl.onResource(NETWORK_STATUS_TYPE, 'currentRoom', this.onCurrentRoomChange, this);
    }

    private isHashSame(): boolean {
        return window.location.hash.substring(1) == this.latestRoom;
    }

    private updateBrowserHash(): void {
        if (!this.isHashSame()) {
            history.replaceState(null, "", '#' + this.latestRoom);
        }
    }

    private changeRoom() {
        resetPhase();
    }

    private onCurrentRoomChange(oldRoom: string | undefined, currentRoom: string | undefined): void {
        if (currentRoom === undefined) return;

        this.latestRoom = currentRoom;
        this.updateBrowserHash();
    }

    private askConfirm(): boolean {
        // M-master?? what are you doing :'(
        if (this.world.isMaster) {
            return confirm("You pasted another room id, do you really want to leave? all of the unsaved progress will be lost");
        } else {
            return true;
        }
    }

    private onHashChange(_ev: HashChangeEvent): void {
        this.logger.info("Hash changed!", location.hash.substring(1));
        if (!this.isHashSame()) {
            if (this.askConfirm()) {
                this.logger.info("Changing room!");
                this.changeRoom();
            } else {
                this.updateBrowserHash();
            }
        }
    }


    enable(): void {
        this.hashChangeListener = this.onHashChange.bind(this);
        window.addEventListener('hashchange', this.hashChangeListener);
    }

    destroy(): void {
        window.removeEventListener('hashchange', this.hashChangeListener);
    }
}
