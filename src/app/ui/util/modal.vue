<template>
    <div ref="modal" class="modal" @click="close">
        <div class="modal-content">
            <div style="text-align: right">
                <button class="close-btn btn" @click="close">X</button>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import Vue from "vue";

    export default Vue.extend({
        methods: {
            open() {
                this.$refs.modal.style.display = "block";
            },

            close() {
                this.$refs.modal.style.display = "none";
            },
        },
    });
</script>

<style scoped>
    .modal {
        display: none;
        position: fixed;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;

        background-color: rgba(0, 0, 0, 0.25);
        text-align: center;
    }

    .modal-content {
        position: relative;
        display: inline-block;
        top: 50%;
        transform: translateY(-50%);
    }

    .close-btn {
        background-color: transparent;
        color: white;
        font-weight: bold;
        border: none;
        outline: none;
    }

    .close-btn:hover {
        cursor: pointer;
    }

</style>