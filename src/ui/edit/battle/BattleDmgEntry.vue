<template>
<tr>
  <th scope="row">{{name}}</th>
  <td><EditableText style="margin: 0;" nullable :model-modifiers="{ lazy: true }"
                    :model-value="dmgExpr" @update:model-value="computeDmgExpr($event)"/></td>
  <td class="p-0" style="background: transparent;" @click="computeDmgExpr()" ref="outcome">
    {{rdmg}}
  </td>
</tr>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch } from "vue";
import { diceComputeExpr } from "../../../util/diceCalc";
import EditableText from "../../util/EditableText.vue";


export default defineComponent({
  components: { EditableText },
  props: {
    dmg: { type: Number, default: 0 },
    name: { type: String, required: true },
  },
  setup(props, context) {
    const { dmg } = toRefs(props);
    const dmgExpr = ref("");
    const outcome = ref<HTMLElement | undefined>(undefined);

    const computeDmgExpr = (expr?: string) => {
      if (expr !== undefined) {
        dmgExpr.value = expr;
      }
      let computedDmg = -Infinity;// -Infinity = error
      try {
        computedDmg = diceComputeExpr(dmgExpr.value);
      } catch(_) {}

      context.emit('update:dmg', computedDmg);
    };

    const toStr = (x) => isNaN(x) ? '0' : (x == -Infinity ? 'Err' : String(x));

    let pending = null;
    const rdmg = ref(toStr(dmg.value));
    watch(dmg, (newValue) => {
      if (pending != null) {
        pending = newValue;
        return;
      }
      pending = newValue;

      setTimeout(() => {
        rdmg.value = toStr(pending);
        pending = null;
      }, 150);

      const elem = outcome.value!;
      elem.classList.add('battle-outcome');
      elem.addEventListener('animationend', () => {
        elem.classList.remove('battle-outcome');
      }, { once: true, });
    });

    return {
      dmgExpr, computeDmgExpr, outcome, rdmg
    };
  },
});
</script>

<style>
.battle-outcome {
  animation: battle-pop 0.3s;
}

@keyframes battle-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
</style>
