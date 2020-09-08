<template>
    <div v-show="components.length > 0">
        <div class="component-btn-header">
            <b-dropdown toggle-class="rounded-0" variant="success" v-if="isAdmin">
                <template v-slot:button-content>
                    <i class="fas fa-plus"></i>
                </template>
                <b-dropdown-item v-for="x in selectedAddable" :key="x.type" @click="emitSpecial('addComponent', x.type)">{{x.name}}</b-dropdown-item>
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

<script lang="ts">
    import EcsComponentWrapper from "./compWrapper.vue";
    export default {
        name: "entity-inspect",
        components: {EcsComponentWrapper},
        props: ['entity', 'components', 'isAdmin', 'selectedAddable'],
        methods: {
            emitSpecial: function (name: string, par: unknown) {
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