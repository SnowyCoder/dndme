<template>
  <table class="table table-dark align-middle text-center">
    <thead>
      <th scope="col">Name</th>
      <th scope="col">HP</th>
      <th scope="col">AC</th>
      <th scope="col">SP</th>
      <th scope="col">IN</th>
    </thead>
    <tbody>
      <tr v-for="x of comps" :key="x.entity" :class="x.rowClass">
        <th scope="row" class="battle-name">{{x.name}}</th>
        <td>{{x.hitPoints}}</td>
        <td>{{x.armorClass}}</td>
        <td>{{x.speed}}</td>
        <td><EditableNumber style="margin: 0; width: 2em;" nullable :model-modifiers="{ lazy: true }"
                            :model-value="x.init" @update:model-value="updateInitiative(x.entity, $event)"/></td>
        <td class="p-0">
          <button class="btn btn-danger btn-xs" v-if="x.hitPoints > 0" title="attack" @click="addAttack(x.entity, x.name)"><AttackIcon/></button>
          <div v-else>
            <i class="fas fa-skull-crossbones"></i>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <span class="text-center fs-4">Attack</span>
  <table class="table table-dark align-middle text-center">
    <thead>
      <th scope="col" class="col">Name</th>
      <th scope="col" class="col-8">Damage</th>
      <th scope="col" class="col-1"></th>
    </thead>
    <tbody>
      <BattleDmgEntry v-for="x in attacks" :key="x.entity" :name="x.name" v-model:dmg="x.dmg" />
    </tbody>
  </table>

  <button class="btn btn-success btn-xl" @click="nextTurn">Next turn</button>
  <button class="btn btn-danger btn-xl" @click="endBattle">End Battle</button>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, ref, ShallowReactive, ShallowRef, triggerRef } from "vue";
import { World } from "../../../ecs/world";
import { BattleComponent, BattleResource, BATTLE_TYPE, StatsComponent, STATS_TYPE } from "../../../ecs/systems/battleSystem";
import { useComponentsOfType, useResource } from "../../vue";
import { NameComponent, NAME_TYPE } from "../../../ecs/component";
import AttackIcon from "../../icons/AttackIcon.vue";
import EditableText from "../../util/EditableText.vue";
import EditableNumber from "../../util/EditableNumber.vue";
import { PLAYER_TYPE } from "../../../ecs/systems/playerSystem";
import { ComponentEditCommand } from "@/ecs/systems/command/componentEdit";
import { componentEditCommand, EditType } from "../../../ecs/systems/command/componentEdit";
import { executeAndLogCommand } from "@/ecs/systems/command/command";
import { ResourceEditCommand } from "@/ecs/systems/command/resourceEditCommand";
import BattleDmgEntry from "./BattleDmgEntry.vue";
import Collapse from "../../util/Collapse.vue";

export default defineComponent({
    components: { AttackIcon, EditableText, EditableNumber, BattleDmgEntry, Collapse },
    props: {
        selectedEntities: {
            type: Array as PropType<Array<{
                id: number;
                name?: string;
            }>>,
            required: true,
        },
        battleRes: {
            type: Object as PropType<ShallowReactive<BattleResource>>,
            required: true,
        }
    },
    setup() {
        const world = inject<ShallowRef<World>>("world")!.value;
        const battleComponents = useComponentsOfType<BattleComponent>(BATTLE_TYPE);
        const battleRes = useResource<BattleResource>(world, BATTLE_TYPE);
        const comps = computed(() => {
            const battleComps = battleComponents.value;
            const battle = battleRes.value;
            return battleComps.sort((b, a) => {// inverted!
              if (a.initiative === undefined) return -1;
              if (b.initiative === undefined) return 1;
              return a.initiative - b.initiative;
            }).map((x, i) => {
                const stats = world.getComponent<StatsComponent>(x.entity, STATS_TYPE);
                const rowClass = [
                  world.getComponent(x.entity, PLAYER_TYPE) ? 'table-success' : 'table-danger',
                ];
                if (battle.turnOf === x.entity || (battle.turnOf === undefined && i === 0)) {
                  rowClass.push('battle-active');
                }
                return {
                  entity: x.entity,
                  name: world.getComponent<NameComponent>(x.entity, NAME_TYPE)?.name ?? String(x.entity).substring(0, 5),
                  hitPoints: stats?.hitPoints ?? '',
                  armorClass: stats?.armorClass ?? '',
                  speed: stats?.speed ?? '',
                  init: x.initiative,
                  rowClass,
                };
            })
        });
        const updateInitiative = (entity: number, initiative: number | undefined) => {
          executeAndLogCommand(world, componentEditCommand(undefined, [{
            type: BATTLE_TYPE,
            entity,
            changes: { initiative },
          }]));
        };
        const endBattle = () => {
          world.events.emit('battle_end');
        };
        const attacks = ref([] as Array<{
          entity: number;
          name: string;
          dmg: number;
        }>);

        const addAttack = (entity: number, name: string) => {
          if (attacks.value.findIndex(x => x.entity === entity) !== -1) return;
          attacks.value.push({
            entity, name,
            dmg: NaN,
          });
          triggerRef(attacks);
        };
        const nextTurn = () => {
          if (attacks.value.length > 0) {
            const edit = [] as EditType[];
            for (let x of attacks.value) {
              if (isNaN(x.dmg) || x.dmg === -Infinity) continue;
              const stats = world.getComponent(x.entity, STATS_TYPE) as StatsComponent;
              if (stats === undefined) continue;
              edit.push({
                type: STATS_TYPE,
                entity: x.entity,
                changes: {
                  hitPoints: Math.max(0, stats.hitPoints - x.dmg),
                },
              });
            }

            const cedit = {
              kind: 'cedit',
              edit,
            } as ComponentEditCommand;
            executeAndLogCommand(world, cedit);

            attacks.value.length = 0;
            triggerRef(attacks);
          }

          let attackIndex = 0;
          const turnOf = battleRes.value.turnOf;
          if (turnOf !== undefined) {
            attackIndex = comps.value.findIndex(x => x.entity === turnOf);
          }
          attackIndex++;
          if (attackIndex >= comps.value.length) attackIndex = 0;
          let editRes = {} as any;
          editRes[BATTLE_TYPE] = {
            turnOf: comps.value[attackIndex].entity,
          };
          const redit = {
            kind: 'redit',
            add: [], remove: [],
            edit: editRes,
          } as ResourceEditCommand;
          executeAndLogCommand(world, redit);
        };
        return {
            comps, updateInitiative, endBattle,
            attacks, addAttack, nextTurn,
        };
    },
});
</script>

<style>
.battle-name {
  transition: color 0.4s;
}
.battle-name::after {
  content: '';
  width: 0px;
  height: 2px;
  display: block;
  background: var(--bs-primary);
  transition: 0.3s;
}
.battle-active .battle-name {
  color: var(--bs-primary);
}
.battle-active .battle-name::after {
  width: 100%;
}
</style>
