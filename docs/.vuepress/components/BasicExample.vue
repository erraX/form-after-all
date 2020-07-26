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
        <Field field-path="foo">
          <template #default="{ field }">
            foo:
            <input
              type="text"
              :value="field.value"
              @input="field.handleInput($event.target.value)"
            />
          </template>
        </Field>
        <Field field-path="bar">
          <template #default="{ field }">
            bar:
            <select
              :value="field.value"
              @input="field.handleInput($event.target.value)"
            >
              <option value="1">value 1</option>
              <option value="2">value 2</option>
              <option value="3">value 3</option>
            </select>
          </template>
        </Field>
        <FriendlyJson title="form.values" :json="form.values" />
      </template>
    </Form>
  </div>
</template>

<style>
.section-example {
  margin-top: 10px;
}
</style>
