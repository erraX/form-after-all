<template>
  <div class="form-after-all">
    <slot :form="form" />
  </div>
</template>

<script>
import { noop } from 'lodash-es';
import useForm, { useFormProvide } from '../hooks/useForm';

export default {
  props: {
    initialState: {
      type: Object,
      default: () => ({}),
    },
    onReset: {
      type: Function,
      default: () => noop,
    },
    onSubmit: {
      type: Function,
      default: () => noop,
    },
    validate: {
      type: Function,
      default: () => () => true,
    },
    validateOnMount: {
      type: Boolean,
      default: false,
    },
    validateOnBlur: {
      type: Boolean,
      default: true,
    },
    validateOnChange: {
      type: Boolean,
      default: true,
    },
  },

  setup(props) {
    const form = useForm(props);
    useFormProvide(form);
    return { form };
  },
};
</script>
