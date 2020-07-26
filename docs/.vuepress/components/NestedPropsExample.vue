<template>
  <div class="section-example">
    <Form
      :initial-state="{
        values: {
          foo: {
            bar: 'foo.bar',
          },
          arr: ['0', '1'],
        },
      }"
    >
      <template #default="{ form }">
        <Field
          field-path="foo.bar"
          defaultValue="default foo.bar"
          :active-when="() => isFooBarActive"
        >
          <template #default="{ field }">
            <div v-if="field.active">
              foo.bar:
              <input
                type="text"
                :value="field.value"
                @input="field.handleInput($event.target.value)"
              />
            </div>
          </template>
        </Field>
        <Field
          field-path="arr[0]"
          defaultValue="default arr[0]"
          :active-when="() => isArr0Active"
        >
          <template #default="{ field }">
            <div v-if="field.active">
              arr[0]:
              <input
                type="text"
                :value="field.value"
                @input="field.handleInput($event.target.value)"
              />
            </div>
          </template>
        </Field>
        <Field
          field-path="arr[1]"
          defaultValue="default arr[1]"
          :active-when="() => isArr1Active"
        >
          <template #default="{ field }">
            <div v-if="field.active">
              arr[1]:
              <input
                type="text"
                :value="field.value"
                @input="field.handleInput($event.target.value)"
              />
            </div>
          </template>
        </Field>
        <div>
          <button @click="isFooBarActive = !isFooBarActive">
            toggle foo active
          </button>
          <button @click="isArr0Active = !isArr0Active">
            toggle arr[0] active
          </button>
          <button @click="isArr1Active = !isArr1Active">
            toggle arr[1] active
          </button>
        </div>
        <FriendlyJson title="form.values" :json="form.values" />
        <FriendlyJson title="form.activeValues" :json="form.activeValues" />
        <FriendlyJson title="form.active" :json="form.active" />
      </template>
    </Form>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api';
export default {
  setup() {
    const isFooBarActive = ref(true);
    const isArr0Active = ref(true);
    const isArr1Active = ref(false);

    return {
      isFooBarActive,
      isArr0Active,
      isArr1Active,
    };
  },
};
</script>

<style>
.section-example {
  margin-top: 10px;
}
</style>
