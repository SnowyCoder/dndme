<template>
    <div>
        <div style="display: flex; align-items: center;">
            Night vision:
            <b-form-checkbox v-model="nightVision" @input="onChange" :readonly="!isAdmin"></b-form-checkbox>
        </div>
        <div style="display: flex; align-items: center;">
            Visibility Range: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ range }}</span>
            <b-input v-if="isAdmin" type="number" step="1" min="0" max="100" v-model="range" size="sm" @change="onChange"></b-input>
        </div>
    </div>
</template>

<script lang="ts">
    export default {
        name: "ecs-player",
        props: ["component", "isAdmin", "allComps"],
        data: function () {
            return {
                nightVision: this.component.nightVision,
                range: this.allComps.visibility.range,
            }
        },
        methods: {
            onChange: function () {
                if (this.component.nightVision !== this.nightVision) {
                    this.$emit('ecs-property-change', 'player', 'nightVision', this.nightVision);
                }
                if (this.component.range !== this.range && this.range !== '') {
                    let c = parseInt(this.range);
                    this.$emit('ecs-property-change', 'visibility', 'range', c);
                }
            }
        },
        watch: {
            'component.nightVision': function (nightVision: boolean) {
                this.nightVision = nightVision;
            },
            'allComps.visibility.range': function (range: number) {
                this.range = range;
            }
        }
    }
</script>

<style scoped>

</style>