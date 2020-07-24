<template>
  <div class="form-after-all__field">
    <slot :field="field" />
  </div>
</template>

<script>
import useField from '../hooks/useField';

export const FIELD_DEFAULT_VALUE = null;
export const DEFAULT_INITIAL_STATE = {
  value: FIELD_DEFAULT_VALUE,
  touched: false,
  error: '',
  active: true,
  editable: true,
  visible: true,
};

export default {
  props: {
    fieldPath: {
      type: String,
      required: true,
    },
    initialState: {
      type: Object,
      default: () => DEFAULT_INITIAL_STATE,
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
      default: null,
    },
    visibleWhen: {
      type: Function,
      default: null,
    },
    editableWhen: {
      type: Function,
      default: null,
    },
  },

  setup(props) {
    const field = useField(props.fieldPath, props);
    return { field };
  },
};
</script>
