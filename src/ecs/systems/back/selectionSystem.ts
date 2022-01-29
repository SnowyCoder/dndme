import {DeserializeData, World} from "../../world";
import {
    Component,
    POSITION_TYPE,
    PositionComponent
} from "../../component";
import {DOOR_TYPE} from "../doorSystem";
import {System} from "../../system";
import {ComponentEditCommand} from "../command/componentEdit";
import {DeSpawnCommand} from "../command/despawnCommand";
import {Command, executeAndLogCommand} from "../command/command";
import {EVENT_COMMAND_LOG, EVENT_COMMAND_PARTIAL_END} from "../command/commandSystem";
import {WALL_TYPE} from "../wallSystem";
import {SingleEcsStorage} from "../../storage";

interface TypeData {
    entities: Set<Component>;
}

export const SELECTION_TYPE = 'selection';
export type SELECTION_TYPE = typeof SELECTION_TYPE;
export class SelectionSystem implements System {
    private readonly ecs: World;
    readonly name = SELECTION_TYPE;
    readonly dependencies = [] as string[];

    selectedEntities = new Set<number>();
    dataByType = new Map<string, TypeData>();

    private isTranslating: boolean = false;
    private translateDirty: boolean = false;

    constructor(ecs: World) {
        this.ecs = ecs;

        this.ecs.events.on('tool_move_begin', () => this.isTranslating = true);
        this.ecs.events.on('tool_move_end', () => {
            this.isTranslating = false;
            if (this.translateDirty) {
                this.translateDirty = false;
                this.ecs.events.emit(EVENT_COMMAND_PARTIAL_END);
                this.update();
            }
        });
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edited', this.onComponentUpdate, this);
        this.ecs.events.on('component_removed', this.onComponentRemove, this);
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
        this.ecs.events.on('deserialized', (d: DeserializeData) => {
            if (d.options.thenSelect) {
                this.setOnlyEntities(d.data.entities.map(d.entityMapping));
            }
        });
        if (ecs.isMaster) {
            this.ecs.events.on('command_post_execute', (c: Command | undefined) => {
                // a spawn command has been executed
                if (c === undefined || c.kind !== 'despawn') return;
                this.setOnlyEntities((c as DeSpawnCommand).entities);
            });
            this.ecs.events.on('delete', () => {
                const cmd = {
                    kind: 'despawn',
                    entities: [...this.selectedEntities],
                } as DeSpawnCommand;
                this.clear();
                executeAndLogCommand(this.ecs, cmd);
            });
        }
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
    }


    canSelect(entity: number): boolean {
        if (this.ecs.isMaster) {
            return true;
        }

        // Make walls not selectable unless a known door is present, this
        // prevents players from bruteforcing wall structures to find doors
        // TODO: other options: merge adiacent walls when possible
        let wallC = this.ecs.getComponent(entity, WALL_TYPE);
        if (wallC !== undefined) {
            let door = this.ecs.getComponent(entity, DOOR_TYPE);
            return door !== undefined;
        }

        return true;
    }

    update() {
        if (this.isTranslating) this.translateDirty = true;
        else {
            this.ecs.events.emit('selection_update', this);
        }
    }

    onComponentAdd(component: Component) {
        if (!this.selectedEntities.has(component.entity)) return;
        if (!this.canSelect(component.entity)) {
            this.removeEntities([component.entity]);
            return;
        }
        this.getOrCreateData(component.type).entities.add(component);
        this.update();
    }

    onComponentUpdate(component: Component) {
        if (this.selectedEntities.has(component.entity)) {
            if (!this.canSelect(component.entity)) {
                this.removeEntities([component.entity]);
                return;
            }
            this.update();
        }
    }

    onComponentRemove(component: Component) {
        if (!this.selectedEntities.has(component.entity)) return;
        let data = this.dataByType.get(component.type)!;
        data.entities.delete(component);
        if (data.entities.size === 0) this.dataByType.delete(component.type);

        if (!this.canSelect(component.entity)) {
            this.removeEntities([component.entity]);
            return;
        }

        this.update();
    }

    onEntityDespawn(entity: number) {
        if (!this.selectedEntities.has(entity)) return;
        this.removeEntities([entity]);
    }

    clear(callListeners: boolean = true, update: boolean = true) {
        if (callListeners) {
            for (let id of this.selectedEntities) {
                this.ecs.events.emit('selection_end', id);
            }
        }
        this.selectedEntities.clear();
        this.dataByType.clear();
        if (update) {
            this.update();
        }
    }

    setOnlyEntity(id: number): void {
        this.clear(true, false);
        this.addEntities([id]);
    }

    setOnlyEntities(ids: number[]): void {
        let idSet = new Set(ids);

        let removeIds = new Array<number>();
        for (let id of this.selectedEntities) {
            if (!idSet.has(id)) removeIds.push(id);
        }
        this.removeEntities(removeIds, false);
        this.addEntities(ids, false);
        this.update();
    }

    toggleEntities(ids: number[], update: boolean=true): void {
        for (let id of ids) {
            if (this.selectedEntities.has(id)) {
                this.removeEntities([id], false);
            } else {
                this.addEntities([id], false);
            }
        }
        if (update) this.update();
    }

    addEntities(ids: number[], update: boolean=true): void {
        let count = 0;
        for (let id of ids) {
            if (id === undefined) {
                console.warn("Trying to add undefined entity");
                continue;
            }
            if (this.selectedEntities.has(id)) continue;
            if (!this.canSelect(id)) {
                continue;
            }
            count++;
            this.selectedEntities.add(id);

            let comps = this.ecs.getAllComponents(id);
            for (let c of comps) {
                this.getOrCreateData(c.type).entities.add(c);
            }
            this.ecs.events.emit('selection_begin', id);
        }
        if (update && count !== 0) this.update();
    }

    removeEntities(ids: number[], update: boolean=true): void {
        let count = 0;
        for (let id of ids) {
            if (!this.selectedEntities.has(id)) continue;
            count++;
            this.selectedEntities.delete(id)
            let comps = this.ecs.getAllComponents(id);
            for (let c of comps) {
                let data = this.dataByType.get(c.type)!;
                data.entities.delete(c);
                if (data.entities.size === 0) this.dataByType.delete(c.type);
            }
            this.ecs.events.emit('selection_end', id);
        }
        if (update && count !== 0) this.update();
    }

    getSelectedByType(type: string): Iterable<Component> {
        let data = this.dataByType.get(type);
        if (data === undefined) return [];
        return data.entities;
    }


    moveAll(diffX: number, diffY: number, entities: Iterable<number>) {
        let edit = [];

        let posSto = this.ecs.getStorage(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        for (let entity of entities) {
            let pos = posSto.getComponent(entity);
            if (pos === undefined) continue;

            edit.push({
                type: POSITION_TYPE,
                entity: entity,
                changes: {
                    x: pos.x + diffX,
                    y: pos.y + diffY,
                },
            });
        }

        let cmd = {
            kind: 'cedit',
            edit,
        } as ComponentEditCommand;
        // partial = isTranslating (and ignore the results)
        this.ecs.events.emit(EVENT_COMMAND_LOG, cmd, undefined, this.isTranslating);
        if (this.isTranslating) this.translateDirty = true;
        else this.update();
    }

    private getOrCreateData(type: string): TypeData {
        let data = this.dataByType.get(type);
        if (data === undefined) {
            data = {
                entities: new Set<Component>(),
            } as TypeData;
            this.dataByType.set(type, data);
        }
        return data;
    }

    hasComponentType(type: string): boolean {
        let data = this.dataByType.get(type);
        if (data === undefined) return false;
        return data.entities.size > 0;
    }

    hasEveryoneType(type: string): boolean {
        let data = this.dataByType.get(type);
        if (data === undefined) return false;
        return data.entities.size === this.selectedEntities.size;
    }


    enable(): void {
    }

    destroy(): void {
    }
}
