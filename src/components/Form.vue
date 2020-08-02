<template>
  <div class="form-after-all">
    <slot :form="form" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import useForm, { useFormProvide, UseFormOptions } from '../hooks/useForm';

export default defineComponent({
  props: {
    initialState: {
      type: Object as () => UseFormOptions['initialState'],
    },
    onReset: (Function as unknown) as () => UseFormOptions['onReset'],
    onSubmit: (Function as unknown) as () => UseFormOptions['onSubmit'],
    validate: (Function as unknown) as () => UseFormOptions['validate'],
    validateOnMount: Boolean,
    validateOnBlur: Boolean,
    validateOnChange: Boolean,
  },

  setup(props) {
    const form = useForm(props);
    useFormProvide(form);
    return { form };
  },
});
</script>
