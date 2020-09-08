<template>
    <div>
        <div>
            Color:
            <b-input type="color" v-model="color" @change="onChange" :readonly="!isAdmin"></b-input>
        </div>
        <div style="display: flex; align-items: center;">
            Visibility Range: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ range }}</span>
            <b-input v-if="isAdmin" type="number" step="1" min="0" max="100" v-model="range" size="sm" @change="onChange"></b-input>
        </div>
    </div>
</template>

<script lang="ts">
    import PIXI from "../../PIXI";
    import hex2string = PIXI.utils.hex2string;
    import string2hex = PIXI.utils.string2hex;

    export default {
        name: "ecs-light",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                color: hex2string(this.component.color),
                range: this.component.range
            }
        },
        methods: {
            onChange: function () {
                if (this.component.color !== this.color && this.color !== '') {
                    let c = string2hex(this.color);
                    this.$emit('ecs-property-change', 'light', 'color', c);
                }
                if (this.component.range !== this.range && this.range !== '') {
                    let c = parseInt(this.range);
                    this.$emit('ecs-property-change', 'light', 'range', c);
                }
            }
        },
        watch: {
            'component.color': function (newColor: number) {
                this.color = hex2string(newColor);
            },
            'component.range': function (range: number) {
                this.range = range;
            }
        }
    }
</script>

<style scoped>

</style>