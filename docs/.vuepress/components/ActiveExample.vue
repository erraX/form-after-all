<template>
  <div class="section-example">
    <Form
      :initial-state="{
        values: {
          foo: 'foo',
          bar: '1',
        },
      }"
    >
      <template #default="{ form }">
        <Field
          field-path="foo"
          defaultValue="default foo"
          :active-when="() => isFooActive"
        >
          <template #default="{ field }">
            <div v-if="field.active">
              foo:
              <input
                type="text"
                :value="field.value"
                @input="field.handleInput($event.target.value)"
              />
            </div>
          </template>
        </Field>
        <Field
          field-path="bar"
          :defaultValue="2"
          :active-when="() => isBarActive"
        >
          <template #default="{ field }">
            <div v-if="field.active">
              bar:
              <select
                :value="field.value"
                @input="field.handleInput($event.target.value)"
              >
                <option value="1">value 1</option>
                <option value="2">value 2</option>
                <option value="3">value 3</option>
              </select>
            </div>
          </template>
        </Field>
        <div>
          <button @click="toggleFooActive">
            toggle foo active
          </button>
          <button @click="toggleBarActive">
            toggle bar active
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
    const isFooActive = ref(true);
    const isBarActive = ref(true);

    const toggleFooActive = () => {
      isFooActive.value = !isFooActive.value;
    };

    const toggleBarActive = () => {
      isBarActive.value = !isBarActive.value;
    };

    return {
      isFooActive,
      isBarActive,
      toggleFooActive,
      toggleBarActive,
    };
  },
};
</script>

<style>
.section-example {
  margin-top: 10px;
}
</style>
