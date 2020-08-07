<template>
    <!--transition name="modal">
        <div class="modal-mask"
             ondragenter="event.stopPropagation(); event.preventDefault();"
             ondragover="event.stopPropagation(); event.preventDefault();"
             v-on:ondrop="event.stopPropagation(); event.preventDefault(); onDrop(event)"
        >
            <div class="modal-wrapper">
                <div class="modal-container">

                    <div class="modal-header">
                        <slot name="header">
                            Insert map to load
                        </slot>
                    </div>

                    <div class="modal-body">
                        <slot name="body">
                            Map loading image
                        </slot>
                    </div>

                    <div class="modal-footer">
                        <slot name="footer">
                            default footer
                            <button class="modal-default-button" @click="$emit('cancel')">
                                Cancel
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
    </transition-->
    <b-modal ref="my-modal" hide-footer title="Gimme the map">
        <div class="d-block text-center">
            <h3>Insert map to load</h3>
        </div>
        <b-button class="mt-3" variant="outline-danger" block @click="hideModal">Cancel</b-button>
    </b-modal>
</template>

<script>
    export default {
        name: "mapInput",
        data() {
            return {
                file: null,
            }
        },
        methods: {
            onDrop: function (event) {

            },
            hideModal: function (event) {
              this.$emit("close");
            }
        }
    }
</script>

<style scoped>
</style>