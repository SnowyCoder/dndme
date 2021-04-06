import {FrozenEntities, World} from "../../world";
import {HideableComponent, HOST_HIDDEN_TYPE} from "../../component";
import {Command, CommandKind} from "./command";
import {DeSpawnCommand} from "./despawnCommand";

export interface SpawnCommand extends Command {
    kind: 'spawn';
    entities: FrozenEntities;
}

export class SpawnCommandKind implements CommandKind {
    readonly kind = 'spawn';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: SpawnCommand): DeSpawnCommand {
        let entities = cmd.entities.map((x) => x.id);
        this.world.respawnEntities(cmd.entities);

        return {
            kind: 'despawn',
            entities: entities,
        } as DeSpawnCommand;
    }

    stripClient(command: SpawnCommand): Command[] {
        let new_ents = command.entities.filter((x) => x.components.find((y) => y.type === HOST_HIDDEN_TYPE) === undefined);
        let map_ents = new_ents.map(x => {
            return {
                id: x.id,
                components: x.components.filter(x => (x as HideableComponent).clientVisible !== false),
            }
        });

        if (map_ents.length === 0) {
            return [];
        }
        return [{
            kind: 'spawn',
            entities: map_ents,
        } as SpawnCommand];
    }

    merge(to: SpawnCommand, from: SpawnCommand): boolean {
        to.entities.push(...from.entities);
        return true;
    }

    isNull(command: SpawnCommand): boolean {
        return command.entities.length === 0;
    }
}
