<template>
    <div>
        <div style="display: flex; align-items: center;">
            Angle: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ rotation }}</span>
            <b-input v-if="isAdmin" type="number" step="0.001" v-model="rotation" size="sm" @change="onChange"></b-input>
        </div>
        <div style="display: flex; align-items: center;">
            Scale: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ scale }}</span>
            <b-input v-if="isAdmin" type="number" step="0.001" v-model="scale" size="sm" @change="onChange"></b-input>
        </div>
    </div>
</template>

<script lang="ts">
import {DEG_TO_RAD, RAD_TO_DEG} from "pixi.js";

    export default {
        name: "ecs-position",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                rotation: this.component.rotation * RAD_TO_DEG,
                scale: this.component.scale
            }
        },
        methods: {
            onChange: function () {
                if (this.rotation !== '') {
                    let r = Math.min(Math.max(parseFloat(this.rotation), 0), 360);
                    if (this.component.rotation !== r) {
                        this.$emit('ecs-property-change', 'transform', 'rotation', r * DEG_TO_RAD);
                    }
                }
                if (this.scale !== '') {
                    let s = parseFloat(this.scale);
                    if (this.component.scale !== s) {
                        this.$emit('ecs-property-change', 'transform', 'scale', s);
                    }
                }
            }
        },
        watch: {
            'component.rotation': function(newVal: number) {
                this.rotation = newVal * RAD_TO_DEG;
            },
            'component.scale': function(newVal: number) {
                this.scale = newVal;
            }
        }
    }
</script>

<style scoped>

</style>