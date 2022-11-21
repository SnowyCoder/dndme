<template>
  <teleport to="body">
    <div class="modal fade" ref="bootstrapModal">
      <div :class="[customDialogClass, dialogClass]"> <!-- dialog -->
        <div class="modal-content" :class="contentClass">
          <div class="modal-header" :class="headerClass" v-if="!hideHeader">
            <slot name="header">
              <h5 class="modal-title">{{ title }}</h5>
              <button type="button" class="btn-close" aria-label="Close" @click="onShowHide(false)"></button>
            </slot>
          </div>
          <div class="modal-body" :class="bodyClass">
            <slot></slot>
          </div>
          <div class="modal-footer" :class="footerClass" v-if="!hideFooter">
            <slot name="footer">
              <button type="button" class="btn btn-secondary" @click="onShowHide(false)">Close</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { Modal } from 'bootstrap';
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref, shallowRef, toRefs, watch } from 'vue';

export default defineComponent({
  props: {
    modelValue: { required: true, type: Boolean },
    hideHeader: { type: Boolean, default: false },
    title: { type: String, default: 'Modal title' },
    hideFooter: { type: Boolean, default: false },

    backdrop: { default: true, type: [Boolean, String] as PropType<boolean | 'static'> },
    keyboard: { default: true, type: Boolean },
    focus: { default: true, type: Boolean },

    centerVertical: { default: false, type: Boolean },
    scrollable: { default: false, type: Boolean },

    dialogClass: { default: '', type: [Object, String] },
    contentClass: { default: '', type: [Object, String] },
    headerClass: { default: '', type: [Object, String] },
    bodyClass: { default: '', type: [Object, String] },
    footerClass: { default: '', type: [Object, String] },
  },
  setup(props, context) {
    const { modelValue, centerVertical, scrollable } = toRefs(props);
    const bootstrapModal = ref<HTMLDivElement>();

    const modal = shallowRef<Modal>();

    const onShowHide = (val: boolean) =>{
      if (modelValue.value == val) return;
      context.emit('update:modelValue', val);
    }

    onMounted(() => {
      const htmlModal = bootstrapModal.value!;
      modal.value = new Modal(htmlModal, {
        backdrop: props.backdrop,
        keyboard: props.keyboard,
        focus: props.focus,
      });

      htmlModal.addEventListener('show.bs.modal', () => {
        onShowHide(true);
      });
      htmlModal.addEventListener('shown.bs.modal', () => {
        if (!modelValue.value) {
          modal.value!.hide();
        }
      });
      htmlModal.addEventListener('hide.bs.modal', () => {
        onShowHide(false);
      });
      htmlModal.addEventListener('hidden.bs.modal', () => {
        if (modelValue.value) {
          modal.value!.hide();
        }
      });

      if (modelValue.value) {
        modal.value.show();
      }
    });
    onUnmounted(() => {
      modal.value?.dispose();
    });

    watch(modelValue, val => {
      //console.log("ONWATCH: ", val);
      if (val) {
        modal.value?.show();
      } else {
        modal.value?.hide();
      }
    });

    const customDialogClass = computed(() => {
      return {
        'modal-dialog': true,
        'modal-dialog-centered': centerVertical.value,
        'modal-dialog-scrollable': scrollable.value,
      };
    });

    return {
      modal, onShowHide, bootstrapModal, customDialogClass,
    }
  },
});
</script>

<style>
</style>
