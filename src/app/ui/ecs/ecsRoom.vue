<template>
    <b-button @click="$emit('ecs-property-change', 'room', 'visible', !component.visible)">
        {{ component.visible ? 'Hide room' : 'Show room' }}
    </b-button>
</template>

<script>
    export default {
        name: "ecs-room",
        props: ["component"],
    }
</script>

<style scoped>

</style>