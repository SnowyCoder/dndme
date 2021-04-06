import {World} from "../../world";
import {HOST_HIDDEN_TYPE} from "../../component";
import {Command, CommandKind} from "./command";
import {SpawnCommand} from "./spawnCommand";

export interface DeSpawnCommand extends Command {
    kind: 'despawn';
    entities: number[];
}

export class DeSpawnCommandKind implements CommandKind {
    readonly kind = 'despawn';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: DeSpawnCommand): SpawnCommand {
        let saved = this.world.despawnEntitiesSave(cmd.entities);

        return  {
            kind: 'spawn',
            entities: saved,
        } as SpawnCommand
    }

    stripClient(command: DeSpawnCommand): Command[] {
        let entities = command.entities.filter(x => this.world.getComponent(x, HOST_HIDDEN_TYPE) === undefined);
        if (entities.length === 0) return [];
        return [{
            kind: 'despawn',
            entities,
        } as DeSpawnCommand];
    }

    merge(to: DeSpawnCommand, from: DeSpawnCommand): boolean {
        to.entities.push(...from.entities);
        return true;
    }

    isNull(command: DeSpawnCommand): boolean {
        return command.entities.length === 0;
    }
}
