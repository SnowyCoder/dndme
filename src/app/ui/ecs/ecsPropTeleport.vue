<template>
    <div>
        <div style="display: flex; align-items: center;">
          Target: <span @click="focusTarget">{{ this.component.targetProp }}</span>
        </div>
        <b-button @click="link">Link</b-button>
        <b-button @click="use">Use</b-button>
    </div>
</template>

<script lang="ts">
    import PIXI from "../../PIXI";
    import hex2string = PIXI.utils.hex2string;
    import string2hex = PIXI.utils.string2hex;

    export default {
        name: "ecs-prop-teleport",
        props: ["component", "isAdmin"],
        data: function () {
            return {
            }
        },
        methods: {
            onChange: function () {
                if (this.component.color !== this.color && this.color !== '') {
                    let c = string2hex(this.color);
                    this.$emit('ecs-property-change', 'pin', 'color', c);
                }
                if (this.label !== this.component.label) {
                    this.$emit('ecs-property-change', 'pin', 'label', this.label);
                }
            },
            focusTarget: function () {
                console.warn("TODO: focus target")
            },
            link: function () {
                this.$emit('ecs-property-change', '@', 'prop_teleport_link', this.component.entity);
            },
            use: function () {
                this.$emit('ecs-property-change', '@', 'prop_use', this.component.entity);
            }
        },
        watch: {
            'component.color': function (newColor: number) {
                this.color = hex2string(newColor);
            },
            'component.label': function (newLabel: string) {
                this.label = newLabel;
            }
        }
    }
</script>

<style scoped>

</style>