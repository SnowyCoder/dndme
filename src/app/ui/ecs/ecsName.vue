<template>
    <b-input v-model="component.name" :readonly="!isAdmin" placeholder="Entity name" @change="onChange"/>
</template>

<script lang="ts">
    export default {
        name: "ecs-name",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                name: this.component.name
            }
        },
        watch: {
            'component.name': function (val: string) {
                this.name = val;
            }
        },
        methods: {
            onChange: function() {
                this.$emit('ecs-property-change', 'name', 'name', this.name, this.component.multiId);
            }
        }
    }
</script>

<style scoped>

</style>