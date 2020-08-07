<template>
    <div v-show="components.length > 0">
        <div class="component-btn-header">
            <b-dropdown toggle-class="rounded-0" variant="success" v-if="isAdmin">
                <template v-slot:button-content>
                    <i class="fas fa-plus"></i>
                </template>
                <b-dropdown-item @click="emitSpecial('addComponent', 'name')">Name</b-dropdown-item>
                <b-dropdown-item @click="emitSpecial('addComponent', 'note')">Note</b-dropdown-item>
            </b-dropdown>
            <b-button squared :title="entity.hidden ? 'Show entity' : 'Hide entity'" style="display: grid" v-if="isAdmin"
                      @click="emitSpecial('hidden', !entity.hidden)">
                <div class="g11" :style="{visibility: entity.hidden ? 'visible' : 'hidden'}"><i class="fas fa-eye-slash"/></div>
                <div class="g11" :style="{visibility: entity.hidden ? 'hidden' : 'visible'}"><i class="fas fa-eye"/></div>
            </b-button>
            <b-button v-if="isAdmin" variant="danger" title="Forget" squared
                      v-show="entity.forgettable" @click="emitSpecial('forget')">
                <i class="fas fa-eraser"></i>
            </b-button>
            <b-button v-if="isAdmin" variant="danger" title="Delete entity" squared
                      @click="emitSpecial('delete')">
                <i class="fas fa-trash"></i>
            </b-button>
        </div>

        <ecs-component-wrapper v-for="comp of components" v-bind:component="comp" v-bind:key="comp.type + (comp.multiId || '')" v-bind:isAdmin="isAdmin"
                               @ecs-property-change="$emit('ecs-property-change', arguments[0], arguments[1], arguments[2], arguments[3])"/>
    </div>
</template>

<script>
    import EcsComponentWrapper from "./compWrapper";
    export default {
        name: "entity-inspect",
        components: {EcsComponentWrapper},
        props: ['entity', 'components', 'isAdmin'],
        methods: {
            emitSpecial: function (name, par) {
                this.$emit('ecs-property-change', '$', name, par);
            }
        }
    }
</script>

<style scoped>
    .component-btn-header {
        margin: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: right;
    }

    .g11 {
        grid-column: 1;
        grid-row: 1;
    }
</style>