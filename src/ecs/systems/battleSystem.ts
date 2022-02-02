
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

    statsStorage = new SingleEcsStorage<StatsComponent>(STATS_TYPE, false, true);
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
        for (let entity of this.selectionSys.selectedEntities) {
            if (this.world.getComponent(entity, PIN_TYPE) === undefined) continue;
            if (this.battleStorage.getComponent(entity) !== undefined) continue;

            const stats = this.statsStorage.getComponent(entity);
            let initiative = undefined;
            if (stats !== undefined && stats.initiativeModifier !== undefined) {
                initiative = 1 + Math.floor(Math.random() * 20) + stats.initiativeModifier;
            }
            this.world.addComponent(entity, {
                type: BATTLE_TYPE,
                initiative,
            } as BattleComponent);
        }
        this.world.addResource({
            type: BATTLE_TYPE,
            _save: true,
            _sync: false,
        } as BattleResource, 'ignore')
    }

    private onBattleEnd() {
        this.world.removeResource(BATTLE_TYPE, false);
        for (let x of [...this.battleStorage.allComponents()]) {
            this.world.removeComponent(x);
        }
    }


    enable(): void {
    }
    destroy(): void {
    }
}


// TODO: custom cursor?