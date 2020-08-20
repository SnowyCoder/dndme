import {EcsTracker} from "../ecs/ecs";
import {Component, NameComponent, NoteComponent, PositionComponent} from "../ecs/component";

const MULTI_TYPES = ['name', 'note'];
const ELIMINABLE_TYPES = ['name', 'note'];
const FULLSCREENABLE_TYPES = ['note'];

// name
// note -> note, position
// position
// room -> room, position
// bkg_img => bkg_img, position

// Possible configurations: (? = 0/1, * = 0+, like regex)
// (bkg_img, pos, name*, notes*)
// (room, pos, name*, notes*)
// (reminder, pos, name*, notes*)

interface TypeData {
    entities: Set<Component>;
}

export class SelectionGroup {
    private ecs: EcsTracker;

    selectedEntities = new Set<number>();
    dataByType = new Map<string, TypeData>();

    private isTranslating: boolean = false;
    private translateDirty: boolean = false;

    constructor(ecs: EcsTracker) {
        this.ecs = ecs;
        this.ecs.events.on('tool_move_begin', () => this.isTranslating = true);
        this.ecs.events.on('tool_move_end', () => {
            this.isTranslating = false;
            if (this.translateDirty) {
                this.translateDirty = false;
                this.update();
            }
        });
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edited', this.onComponentUpdate, this);
        this.ecs.events.on('component_removed', this.onComponentRemove, this);
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
    }

    update() {
        if (this.isTranslating) this.translateDirty = true;
        else this.ecs.events.emit('selection_update', this);
    }

    onComponentAdd(component: Component) {
        if (!this.selectedEntities.has(component.entity)) return;
        this.getOrCreateData(component.type).entities.add(component);
        this.update();
    }

    onComponentUpdate(component: Component) {
        if (this.selectedEntities.has(component.entity)) this.update();
    }

    onComponentRemove(component: Component) {
        if (!this.selectedEntities.has(component.entity)) return;
        let data = this.dataByType.get(component.type);
        data.entities.delete(component);
        if (data.entities.size === 0) this.dataByType.delete(component.type);
        this.update();
    }

    onEntityDespawn(entity: number) {
        if (!this.selectedEntities.has(entity)) return;
        this.removeEntity(entity);
        this.update();
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
        this.addEntity(id);
    }

    toggleEntity(id: number): void {
        if (this.selectedEntities.has(id)) {
            this.removeEntity(id);
        } else {
            this.addEntity(id);
        }
    }

    addEntity(id: number): void {
        this.selectedEntities.add(id);

        let comps = this.ecs.getAllComponents(id);
        for (let c of comps) {
            this.getOrCreateData(c.type).entities.add(c);
        }
        this.ecs.events.emit('selection_begin', id);
        this.update();
    }

    removeEntity(id: number): void {
        this.selectedEntities.delete(id)
        let comps = this.ecs.getAllComponents(id);
        for (let c of comps) {
            let data = this.dataByType.get(c.type);
            data.entities.delete(c);
            if (data.entities.size === 0) this.dataByType.delete(c.type);
        }
        this.ecs.events.emit('selection_end', id);
        this.update();
    }

    getSelectedByType(type: string): Iterable<Component> {
        let data = this.dataByType.get(type);
        if (data === undefined) return [];
        return data.entities;
    }

    private initialComponent(type: string): Object {
        return {
            _canDelete: ELIMINABLE_TYPES.indexOf(type) >= 0,
            _isFullscreen: FULLSCREENABLE_TYPES.indexOf(type) >= 0 ? false : undefined,
        };
    }

    private getSingleComponents(): Component[] {
        let res = new Array<Component>();
        let entity = this.selectedEntities.values().next().value;

        for (let type of this.ecs.storages.keys()) {
            if (type.startsWith('host_')) continue;

            let comps = this.ecs.storages.get(type).getComponents(entity);
            for (let comp of comps) {
                res.push(removePrivate(this.initialComponent(type), comp));
            }
        }

        return res;
    }

    getCommonComponents(): Component[] {
        if (this.selectedEntities.size === 0) return [];

        let selCount = this.selectedEntities.size;

        if (selCount === 1) return this.getSingleComponents();
        let commonTypes = new Array<string>();

        for (let type of this.ecs.storages.keys()) {
            if (type === 'host_hidden') continue;

            let data = this.dataByType.get(type);
            if (data != undefined && data.entities.size === selCount && MULTI_TYPES.indexOf(type) === -1) {
                commonTypes.push(type);
            }
        }

        let res = new Array<Component>();

        for (let type of commonTypes) {
            if (type === 'host_hidden') continue;
            let component = undefined;
            for (let entity of this.selectedEntities) {
                let comps = this.ecs.storages.get(type).getComponents(entity);
                for (let comp of comps) {
                    if (component === undefined) {
                        component = removePrivate(this.initialComponent(type), comp);// copy
                    } else {
                        biFilterObj(component, comp);
                    }
                }
            }
            res.push(component);
        }

        return res;
    }

    getCommonEntityOpts(): any {
        let hostHidden = this.dataByType.get('host_hidden');
        let rooms = this.dataByType.get('room');

        return {
            hidden: hostHidden !== undefined && hostHidden.entities.size === this.selectedEntities.size,
            forgettable: rooms !== undefined && rooms.entities.size === this.selectedEntities.size,
        };
    }

    setProperty(type: string, propertyName: string, propertyValue: any, multiId?: number): void {
        if (type === '$') {
            // Special management
            switch (propertyName) {
                case 'hidden':
                    for (let entity of this.selectedEntities) {
                        let cmp = this.ecs.getComponent(entity, 'host_hidden');

                        if (cmp !== undefined) {
                            this.ecs.removeComponent(cmp);
                        } else {
                            this.ecs.addComponent(entity, {
                                type: 'host_hidden',
                                entity: -1,
                            });
                        }
                    }
                    break;
                case 'forget':
                    alert("TODO: forget room")// TODO
                    break;
                case 'delete':
                    for (let entity of [...this.selectedEntities]) {
                        this.ecs.despawnEntity(entity);
                    }
                    this.clear();
                    break;
                case 'addComponent':
                    let comp: Component;
                    switch (propertyValue) {
                        case 'name':
                            comp = {
                                type: 'name',
                                name: '',
                                clientVisible: true,
                            } as NameComponent;
                            break;
                        case 'note':
                            comp = {
                                type: 'note',
                                note: '',
                                clientVisible: true,
                            } as NoteComponent;
                            break;
                        default: throw 'Cannot add unknown component: ' + propertyValue;
                    }
                    for (let entity of [...this.selectedEntities]) {
                        this.ecs.addComponent(entity, Object.assign({}, comp));
                    }
                    break;
                case 'removeComponent':
                    for (let entity of [...this.selectedEntities]) {
                        let comp = this.ecs.getComponent(entity, propertyValue, multiId);
                        if (comp === undefined) continue;
                        this.ecs.removeComponent(comp);
                    }
                    break;
                default:
                    console.warn("Unknown special event: " + propertyName);
            }
            return;
        }

        for (let entity of this.selectedEntities) {
            let changes = {} as any;
            changes[propertyName] = propertyValue;
            this.ecs.editComponent(entity, type, changes, multiId);
        }
        this.update();
    }

    moveAll(diffX: number, diffY: number) {
        for (let entity of this.selectedEntities) {
            let pos = this.ecs.getComponent(entity, 'position') as PositionComponent;
            if (pos === undefined) continue;

            this.ecs.editComponent(entity, 'position', {
                x: pos.x + diffX,
                y: pos.y + diffY,
            });
        }
        if (this.isTranslating) this.translateDirty = true;
        else this.update();
    }

    private getOrCreateData(type: string): TypeData {
        let data: TypeData = this.dataByType.get(type);
        if (data === undefined) {
            data = {
                entities: new Set<Component>(),
            } as TypeData;
            this.dataByType.set(type, data);
        }
        return data;
    }

    private hasComponentType(type: string): boolean {
        let data = this.dataByType.get(type);
        if (data === undefined) return false;
        return data.entities.size > 0;
    }
}

function removePrivate(target: any, filter: any): any {
    for (let name in filter) {
        if (name[0] === '_') continue;
        target[name] = filter[name];
    }
    return target;
}

function biFilterObj(target: any, filter: any): void {
    for (let name in filter) {
        if (name[0] === '_') continue;
        if (target[name] !== filter[name]) {
            target[name] = null;
        }
    }
    for (let name in target) {
        if (name[0] === '_') continue;
        if (filter[name] === undefined) {
            target[name] = null;
        }
    }
}

