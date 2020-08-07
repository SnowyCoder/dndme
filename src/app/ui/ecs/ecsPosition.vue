<template>
    <div>
        <div style="display: flex; align-items: center;">
            X: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ x }}</span>
            <b-input v-if="isAdmin" type="number" step="0.001" v-model="x" size="sm" @change="onChange"></b-input>
        </div>
        <div style="display: flex; align-items: center;">
            Y: <span v-if="!isAdmin" style="margin-left: 0.5rem;"> {{ y }}</span>
            <b-input v-if="isAdmin" type="number" step="0.001" v-model="y" size="sm" @change="onChange"></b-input>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ecs-position",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                x: this.component.x,
                y: this.component.y,
            }
        },
        methods: {
            onChange: function () {
                if (this.component.x !== this.x && this.x !== '') {
                    this.$emit('ecs-property-change',  'position', 'x', parseFloat(this.x));
                }
                if (this.component.y !== this.y && this.y !== '') {
                    this.$emit('ecs-property-change', 'position', 'y', parseFloat(this.y));
                }
            }
        },
        watch: {
            'component.x': function(newVal) {
                this.x = newVal;
            },
            'component.y': function(newVal) {
                this.y = newVal;
            }
        }
    }
</script>

<style scoped>

</style>