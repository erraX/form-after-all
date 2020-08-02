<template>
  <div class="form-after-all__field">
    <slot :field="field" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import useField, { UseFieldOptions } from '../hooks/useField';

export default defineComponent({
  props: {
    fieldPath: {
      type: String,
      required: true,
    },
    restoreWhenBecomeInactive: {
      type: Boolean,
      default: undefined,
    },
    initialTouched: {
      type: Boolean,
      default: undefined,
    },
    initialError: String,
    defaultValue: null,
    activeWhen: (Function as unknown) as () => UseFieldOptions['activeWhen'],
    visibleWhen: (Function as unknown) as () => UseFieldOptions['visibleWhen'],
    editableWhen: (Function as unknown) as () => UseFieldOptions['editableWhen'],
  },

  setup(props) {
    const field = useField(props.fieldPath, props);
    return { field };
  },
});
</script>
