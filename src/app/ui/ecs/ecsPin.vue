<template>
    <b-input type="color" v-model="color" @change="onChange"></b-input>
</template>

<script>
    export default {
        name: "ecs-pin",
        props: ["component"],
        data: function () {
            return {
                color: '#' + this.component.color.toString(16).padEnd(6, '0'),
            }
        },
        methods: {
            onChange: function () {
                if (this.component.color !== this.color && this.color !== '') {
                    let c = parseInt(this.color.substring(1), 16);
                    this.$emit('ecs-property-change', 'pin', 'color', c);
                }
            }
        },
        watch: {
            'component.color': function (newColor) {
                this.color = '#' + newColor.toString(16).padEnd(6, '0');
            }
        }
    }
</script>

<style scoped>

</style>