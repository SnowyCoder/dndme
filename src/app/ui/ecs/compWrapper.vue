<template>
    <div>
        <div>
            <div class="component-header">
                <div @click="visible = !visible" style="width: 100%"> {{ component.type }} </div>
                <b-button v-if="isAdmin" squared size="sm" style="display: grid;"
                          :title="component.clientVisible ? 'Hide component' : 'Show component'"
                          v-show="component.clientVisible !== undefined"
                          @click="$emit('ecs-property-change', component.type, 'clientVisible', !component.clientVisible)">
                    <div class="g11" v-show="component.clientVisible"><i class="fas fa-eye"/></div>
                    <div class="g11" v-show="!component.clientVisible"><i class="fas fa-eye-slash"/></div>
                </b-button>
                <b-button v-if="isAdmin" squared size="sm" variant="primary" title="Fullscreen"
                          v-show="component._isFullscreen !== undefined" @click="component._isFullscreen = true">
                    <i class="fas fa-expand"/>
                </b-button>
                <b-button v-if="isAdmin" squared size="sm" variant="danger" title="Delete" v-show="component._canDelete"
                          @click="$emit('ecs-property-change', '$', 'removeComponent', component.type, component.multiId)">
                    <i class="fas fa-trash"/>
                </b-button>
            </div>
        </div>
        <b-collapse v-model="visible" class="component-body" visible>
            <component v-bind:is="componentType" v-bind:component="component" v-bind:isAdmin="isAdmin"
                       v-on:ecs-property-change="$emit('ecs-property-change', arguments[0], arguments[1], arguments[2], arguments[3])">

            </component>
        </b-collapse>
    </div>
</template>

<script>
    import ecsName from "./ecsName";
    import ecsNote from "./ecsNote";
    import ecsPosition from "./ecsPosition";
    import ecsRoom from "./ecsRoom";
    import ecsBackgroundImage from "./ecsBackgroundImage";
    import ecsPin from "./ecsPin";

    export default {
        name: "ecs-component-wrapper",
        props: ["component", "isAdmin"],
        data: function() {
            return {
                visible: true,
            }
        },
        computed: {
            componentType: function () {
                return "ecs-" + this.component.type.replace('_', '-');
            }
        },
        components: {
            ecsName, ecsNote, ecsPosition, ecsRoom, ecsBackgroundImage, ecsPin,
        }
    }
</script>

<style scoped>
    .component-header {
        display: flex;
        align-items: center;
        margin-left: 5px;
        margin-bottom: 2px;
    }

    .component-header button:last-child {
        margin-right: 10px;
    }

    .component-body {
        margin-left: 12px;
        margin-right: 12px;
    }

    .g11 {
        grid-row: 1;
        grid-column: 1;
    }
</style>