<template>
  <div>
    <div>
      Type:
      <span v-if="!isAdmin">
        {{ this.doorTypeName }}
      </span>
      <b-form-select v-if="isAdmin" v-model="doorType" class="mb-3">
        <b-form-select-option value="normall">Normal</b-form-select-option>
        <b-form-select-option value="normalr">Normal right</b-form-select-option>
        <b-form-select-option value="rotate">Rotating</b-form-select-option>
      </b-form-select>
    </div>
    <div style="display: flex; align-items: center;">
      <span v-if="!isAdmin">{{ open ? "Open" : "Closed" }}</span>
      <span v-if="!isAdmin" v-show="this.locked" style="margin-left: 0.5rem;"><i class="fas fa-lock"></i></span>

      <b-button v-if="isAdmin" :pressed.sync="open">{{ open ? "Open" : "Closed" }}</b-button>
      <b-button v-if="isAdmin" :pressed.sync="locked">
        <div v-show="locked"><i class="fas fa-lock"></i></div>
        <div v-show="!locked"><i class="fas fa-lock-open"></i></div>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
    import {DoorType} from "../../ecs/systems/doorSystem";

    export default {
        name: "ecs-door",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                doorType: this.component.doorType,
                open: this.component.open,
                locked: this.component.locked,
            }
        },
        methods: {
            onChange: function () {
                if (this.component.doorType !== this.doorType) {
                    this.$emit('ecs-property-change', 'door', 'doorType', this.doorType);
                }
                if (this.component.open !== this.open) {
                    this.$emit('ecs-property-change', 'door', 'open', this.open);
                }
                if (this.component.locked !== this.locked) {
                    this.$emit('ecs-property-change', 'door', 'locked', this.locked);
                }
            }
        },
        computed: {
            doorTypeName: function (): string {
                switch (this.doorType) {
                    case DoorType.NORMAL_LEFT: return "Normal";
                    case DoorType.NORMAL_RIGHT: return "Normal right";
                    case DoorType.ROTATE: return "Rotating";
                    default: return "Unknown??"
                }
            }
        },
        watch: {
            'component.doorType': function (doorType: string) {
                this.doorType = doorType;
            },
            'component.open': function (open: boolean) {
                this.open = open;
            },
            'component.locked': function (locked: boolean) {
                this.locked = locked;
            },
            'doorType': function (dt: string) {
                this.onChange();
            },
            'open': function (dt: string) {
                this.onChange();
            },
            'locked': function (dt: string) {
                this.onChange();
            }
        }
    }
</script>

<style scoped>

</style>