import {World} from "../../world";
import {SHARED_TYPE} from "../../component";
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
        const data = this.world.serialize({
            only: new Set(cmd.entities),
            requireSave: true,
        });
        this.apply(cmd);

        return  {
            kind: 'spawn',
            data,
        } as SpawnCommand
    }

    apply(cmd: DeSpawnCommand): void {
        for (let e of cmd.entities) {
            this.world.despawnEntity(e);
        }
    }

    stripClient(command: DeSpawnCommand): Command[] {
        let entities = command.entities.filter(x => this.world.getComponent(x, SHARED_TYPE) !== undefined);
        if (entities.length === 0) return [];
        return [{
            kind: 'despawn',
            entities,
        } as DeSpawnCommand];
    }

    merge(to: DeSpawnCommand, from: DeSpawnCommand, strict: boolean): boolean {
        if (strict) return false;
        to.entities.push(...from.entities);
        return true;
    }

    isNull(command: DeSpawnCommand): boolean {
        return command.entities.length === 0;
    }
}
