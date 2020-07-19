<template>
  <div class="form-after-all__field">
    <slot :field="field" />
  </div>
</template>

<script>
import useField from '../hooks/useField';

const FIELD_DEFAULT_VALUE = undefined;

export default {
  props: {
    fieldPath: {
      type: String,
      required: true,
    },
    initialState: {
      type: Object,
      default: () => ({
        value: FIELD_DEFAULT_VALUE,
        touched: false,
        error: false,
        active: true,
        editable: true,
        visible: true,
      }),
    },
    restoreWhenBecomeInactive: {
      type: Boolean,
      default: true,
    },
    defaultValue: {
      type: null,
      default: FIELD_DEFAULT_VALUE,
    },
    activeWhen: {
      type: Function,
      default: () => true,
    },
    visibleWhen: {
      type: Function,
      default: () => true,
    },
    editableWhen: {
      type: Function,
      default: () => true,
    },
  },

  setup(props) {
    const field = useField(props);
    return { field };
  },
};
</script>
