<template>
  <Field ref="field" v-bind="$props">
    <template #default="{ field }">
      <span class="value">{{ field.value }}</span>
      <span class="touched">{{ field.touched }}</span>
      <span class="error">{{ field.error }}</span>
      <span class="active">{{ field.active }}</span>
      <span class="editable">{{ field.editable }}</span>
      <span class="visible">{{ field.visible }}</span>
    </template>
  </Field>
</template>

<script>
import { Field } from '../src/components';

export default {
  components: { Field },
  props: Field.props,
};
</script>
