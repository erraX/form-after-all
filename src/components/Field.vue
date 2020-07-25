<template>
  <div class="form-after-all__field">
    <slot :field="field" />
  </div>
</template>

<script>
import useField from '../hooks/useField';

export default {
  props: {
    fieldPath: {
      type: String,
      required: true,
    },
    restoreWhenBecomeInactive: {
      type: Boolean,
      default: true,
    },
    initialTouched: Boolean,
    initialError: String,
    defaultValue: {
      type: null,
      default: undefined,
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
