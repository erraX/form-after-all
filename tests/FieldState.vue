<template>
  <Field ref="field" v-bind="$props">
    <template #default="{ field }">
      <span :data-key="fieldPath" class="value">{{ field.value }}</span>
      <span :data-key="fieldPath" class="touched">{{ field.touched }}</span>
      <span :data-key="fieldPath" class="error">{{ field.error }}</span>
      <span :data-key="fieldPath" class="active">{{ field.active }}</span>
      <span :data-key="fieldPath" class="editable">{{ field.editable }}</span>
      <span :data-key="fieldPath" class="visible">{{ field.visible }}</span>
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
