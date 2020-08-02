<template>
  <div class="form-after-all">
    <slot :form="form" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import useForm, { useFormProvide, UseFormParams } from '../hooks/useForm';

export default defineComponent({
  props: {
    initialState: {
      type: Object as () => UseFormParams['initialState'],
    },
    onReset: (Function as unknown) as () => UseFormParams['onReset'],
    onSubmit: (Function as unknown) as () => UseFormParams['onSubmit'],
    validate: (Function as unknown) as () => UseFormParams['validate'],
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
