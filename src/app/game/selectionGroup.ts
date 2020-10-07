import {World} from "../ecs/ecs";
import {Component, NameComponent, NoteComponent, PositionComponent} from "../ecs/component";
import {LightComponent} from "../ecs/systems/lightSystem";
import {PlayerComponent} from "../ecs/systems/playerSystem";

const MULTI_TYPES = ['name', 'note'];
const ELIMINABLE_TYPES = ['name', 'note', 'player', 'light'];
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

export interface AddComponent {
    type: string,
    name: string,
}

export class SelectionGroup {
    private ecs: World;

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

    setOnlyEntities(ids: number[]): void {
        let idSet = new Set(ids);

        let removeIds = new Array<number>();
        for (let id of this.selectedEntities) {
            if (!idSet.has(id)) removeIds.push(id);
        }
        for (let id of removeIds) {
            this.removeEntity(id);
        }
        for (let id of ids) {
            if (this.selectedEntities.has(id)) continue;
            this.addEntity(id);
        }
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
        let storage = this.ecs.storages.get(type);
        return {
            _canDelete: ELIMINABLE_TYPES.indexOf(type) >= 0,
            _isFullscreen: FULLSCREENABLE_TYPES.indexOf(type) >= 0 ? false : undefined,
            _sync: storage.sync,
            _save: storage.save,
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

        return {
            hidden: hostHidden !== undefined && hostHidden.entities.size === this.selectedEntities.size,
        };
    }

    getAddableComponents(): Array<AddComponent> {
        let res = new Array<AddComponent>();

        res.push(
            {
                type: 'name',
                name: 'Name'
            }, {
               type: 'note',
               name: 'Note'
            }
        );

        if (this.hasEveryoneType('pin') && !(this.hasComponentType('light') || this.hasComponentType('player'))) {
            res.push({
                type: 'light',
                name: 'Light'
            }, {
                type: 'player',
                name: 'Player',
            });
        }

        return res;
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
                        case 'light':
                            comp = {
                                type: 'light',
                                color: 0xFFFFFF,
                                range: 5,
                            } as LightComponent;
                            break;
                        case 'player':
                            comp = {
                                type: 'player',
                                nightVision: false,
                                range: 50,
                            } as PlayerComponent;
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


