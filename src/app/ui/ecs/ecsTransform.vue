<template>
    <div>
        <div style="display: flex; align-items: center;">
            Angle: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ rotation }}</span>
            <b-input v-if="isAdmin" type="number" step="0.001" v-model="rotation" size="sm" @change="onChange"></b-input>
        </div>
    </div>
</template>

<script lang="ts">
    export default {
        name: "ecs-position",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                rotation: this.component.rotation,
            }
        },
        methods: {
            onChange: function () {
                if (this.rotation === '') return;
                let r = Math.min(Math.max(parseFloat(this.rotation), 0), 360);
                if (this.component.rotation !== r) {
                    this.$emit('ecs-property-change',  'transform', 'rotation', r);
                }
            }
        },
        watch: {
            'component.rotation': function(newVal: number) {
                this.rotation = newVal;
            }
        }
    }
</script>

<style scoped>

</style>