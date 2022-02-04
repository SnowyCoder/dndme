
import { Component } from "../component";
import { System } from "../system";
import { World } from "../world";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE, SELECTION_UI_TYPE } from "./back/selectionUiSystem";
import { ToolSystem, TOOL_TYPE } from "./back/toolSystem";
import AttackIconVue from "../../ui/icons/AttackIcon.vue";
import { StandardToolbarOrder } from "../../phase/editMap/standardToolbarOrder";
import AttackVue from "../../ui/edit/battle/Attack.vue";
import { Resource } from "../resource";
import { SingleEcsStorage } from "../storage";
import { SelectionSystem, SELECTION_TYPE } from "./back/selectionSystem";
import { PIN_TYPE } from "./pinSystem";
import EcsStatsVue from "../../ui/ecs/EcsStats.vue";
import { executeAndLogCommand } from "./command/command";
import { ComponentEditCommand } from "./command/componentEdit";
import { ResourceEditCommand } from "./command/resourceEditCommand";


export const STATS_TYPE = 'stats';
export type STATS_TYPE = typeof STATS_TYPE;
export interface StatsComponent extends Component {
    type: STATS_TYPE;
    initiativeModifier?: number;
    hitPoints: number;
    maxHitPoints: number;
    armorClass: number;
    speed: number;
}

export const BATTLE_TYPE = 'battle';
export type BATTLE_TYPE = typeof BATTLE_TYPE;
export interface BattleComponent extends Component {
    type: BATTLE_TYPE;
    initiative?: number;
}

export interface BattleResource extends Resource {
    type: BATTLE_TYPE;
    turnOf: number;
}


export class BattleSystem implements System {
    readonly world: World;
    readonly name = BATTLE_TYPE;
    readonly dependencies = [SELECTION_UI_TYPE, TOOL_TYPE];

    private readonly selectionSys: SelectionSystem;

    statsStorage = new SingleEcsStorage<StatsComponent>(STATS_TYPE, true, true);
    battleStorage = new SingleEcsStorage<BattleComponent>(BATTLE_TYPE, false, true);

    constructor(world: World) {
        this.world = world;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;

        world.addStorage(this.statsStorage);
        world.addStorage(this.battleStorage);

        // The system is only register on master worlds
        let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
        toolSys.addTool(BATTLE_TYPE, {
            parts: ['space_pan', 'select',],
            sideBar: AttackVue,
            toolbarEntry: {
                icon: AttackIconVue,
                title: 'Battle',
                priority: StandardToolbarOrder.BATTLE,
            },
        });
        world.events.on('populate', () => {
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: STATS_TYPE,
                name: 'Stats',
                panel: EcsStatsVue,
                panelPriority: 80,
                addEntry: {
                    whitelist: [PIN_TYPE],
                    blacklist: [STATS_TYPE],
                    component(entity: number) {
                        return [{
                            type: STATS_TYPE,
                            entity,
                            hitPoints: 10,
                            maxHitPoints: 10,
                            armorClass: 10,
                            speed: 10,
                        } as StatsComponent];
                    }
                }
            } as ComponentInfoPanel);
        });
        world.events.on('battle_begin', this.onBattleBegin, this);
        world.events.on('battle_end', this.onBattleEnd, this);
    }

    private onBattleBegin() {
        let add = [];
        for (let entity of this.selectionSys.selectedEntities) {
            const stats = this.statsStorage.getComponent(entity);
            if (stats === undefined) continue;
            if (this.battleStorage.getComponent(entity) !== undefined) continue;

            let initiative = undefined;
            if (stats.initiativeModifier !== undefined) {
                initiative = 1 + Math.floor(Math.random() * 20) + stats.initiativeModifier;
            }
            add.push({
                type: BATTLE_TYPE,
                entity,
                initiative,
            } as BattleComponent);
        }
        if (add.length > 0) {
            const cmd = {
                kind: 'cedit',
                add,
            } as ComponentEditCommand;
            executeAndLogCommand(this.world, cmd);

            if (this.world.getResource(BATTLE_TYPE) === undefined) {
                const resCmd = {
                    kind: 'redit',
                    add: [{
                        type: BATTLE_TYPE,
                        _save: true,
                        _sync: false,
                    } as BattleResource],
                    edit: {},
                    remove: [],
                } as ResourceEditCommand;
                executeAndLogCommand(this.world, resCmd);
            }
        }
    }

    private onBattleEnd() {
        if (this.world.getResource(BATTLE_TYPE) !== undefined) {
            const resCmd = {
                kind: 'redit',
                add: [],
                edit: {},
                remove: [BATTLE_TYPE],
            } as ResourceEditCommand;
            executeAndLogCommand(this.world, resCmd);
        }
        let remove = [...this.battleStorage.allComponents()];
        if (remove.length > 0) {
            executeAndLogCommand(this.world, {
                kind: 'cedit',
                remove
            } as ComponentEditCommand);
        }
    }


    enable(): void {
    }
    destroy(): void {
    }
}


// TODO: custom cursor?
