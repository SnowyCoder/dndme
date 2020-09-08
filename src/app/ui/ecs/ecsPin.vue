<template>
    <div>
        <b-input type="color" v-model="color" @change="onChange" :readonly="!isAdmin"></b-input>
        <b-input v-model="label" :readonly="!isAdmin" placeholder="Label" @change="onChange"/>
    </div>
</template>

<script lang="ts">
    import PIXI from "../../PIXI";
    import hex2string = PIXI.utils.hex2string;
    import string2hex = PIXI.utils.string2hex;

    export default {
        name: "ecs-pin",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                color: hex2string(this.component.color),
                label: this.component.label,
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