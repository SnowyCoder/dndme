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
        <th scope="row">{{x.name}}</th>
        <td>{{x.hitPoints}}</td>
        <td>{{x.armorClass}}</td>
        <td>{{x.speed}}</td>
        <td><EditableNumber style="margin: 0; width: 2em;" nullable :model-modifiers="{ lazy: true }"
                            :model-value="x.init" @update:model-value="updateInitiative(x.entity, $event)"/></td>
        <td class="p-0">
          <button class="btn btn-danger btn-xs" title="attack"><AttackIcon/></button>
        </td>
      </tr>
    </tbody>
  </table>

  <button class="btn btn-danger btn-xl" @click="endBattle">End Battle</button>
</template>

<script lang="ts">
import { computed, customRef, defineComponent, inject, PropType, ShallowReactive, ShallowRef } from "vue";
import { World } from "../../../ecs/world";
import { BattleComponent, BattleResource, BATTLE_TYPE, StatsComponent, STATS_TYPE } from "../../../ecs/systems/battleSystem";
import { useComponentsOfType } from "../../vue";
import { NameComponent, NAME_TYPE } from "../../../ecs/component";
import AttackIcon from "../../icons/AttackIcon.vue";
import EditableText from "../../util/EditableText.vue";
import EditableNumber from "../../util/EditableNumber.vue";
import { PLAYER_TYPE } from "../../../ecs/systems/playerSystem";

export default defineComponent({
    components: { AttackIcon, EditableText, EditableNumber },
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
        const comps = computed(() => {
            const battleComps = battleComponents.value;
            return battleComps.map(x => {
                const stats = world.getComponent<StatsComponent>(x.entity, STATS_TYPE);
                return {
                  entity: x.entity,
                  name: world.getComponent<NameComponent>(x.entity, NAME_TYPE)?.name ?? String(x.entity).substring(0, 5),
                  hitPoints: stats?.hitPoints ?? '',
                  armorClass: stats?.armorClass ?? '',
                  speed: stats?.speed ?? '',
                  init: x.initiative,
                  rowClass: world.getComponent(x.entity, PLAYER_TYPE) ? 'table-success battle-actve' : 'table-danger',
                };
            }).sort((b, a) => {// inverted!
              if (a.init === undefined) return -1;
              if (b.init === undefined) return 1;
              return a.init - b.init;
            });
        });
        const updateInitiative = (entity: number, initiative: number | undefined) => {
          world.editComponent(entity, BATTLE_TYPE, { initiative });
        };
        const endBattle = () => {
          world.events.emit('battle_end');
        };
        return {
            comps, updateInitiative, endBattle,
        };
    },
});
</script>

<style>
.battle-actve {
  border-left: 4px var(--bs-primary) solid;
}
</style>