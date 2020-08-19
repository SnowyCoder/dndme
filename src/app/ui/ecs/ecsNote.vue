<template>
    <div>
        <b-textarea placeholder="Write something here..." v-model="note" :readonly="!isAdmin"
                  @change="onChange"/>
        <b-modal title="Note" v-model="component._isFullscreen" dialog-class="modal-fullscreen modal-xxl" hide-footer hide-header>
            <b-textarea placeholder="Write something here..."  v-model="note"  :readonly="!isAdmin"
                        @change="onChange" style="height: 100%; resize: none;"/>
            <template v-slot:modal-footer>
            </template>
        </b-modal>
    </div>
</template>

<script>
    export default {
        name: "ecs-note",
        props: ["component", "isAdmin"],
        data: function () {
            return {
                note: this.component.note,
                console: console
            }
        },
        watch: {
            'component.note': function (val) {
                this.note = val;
            }
        },
        methods: {
            onChange: function () {
                this.$emit('ecs-property-change', 'note', 'note', this.note, this.component.multiId);
            }
        }
    }
</script>

<style scoped>

</style>