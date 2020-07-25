import { mount } from '@vue/test-utils';
import { Form } from '../src/components';
import FieldState from './FieldState';

export default (propsData) => {
  const wrapper = mount(
    {
      components: { Form, FieldState },
      template: `
        <Form ref="form" v-bind="formProps">
          <FieldState
            v-for="field in fields"
            :key="field.fieldPath"
            :ref="field.fieldPath"
            :field-path="field.fieldPath"
            v-bind="field.props"
          />
        </Form>
      `,
      props: {
        formProps: {
          type: Object,
          default: () => ({}),
        },
        fields: {
          type: Array,
          required: true,
        },
      },
    },
    { propsData: propsData }
  );

  const fieldFieldPaths = propsData.fields.map((f) => f.fieldPath);
  const formRef = wrapper.findComponent({ ref: 'form' }).vm;

  const fieldRefs = fieldFieldPaths.reduce(
    (prev, cur) => ({
      ...prev,
      [cur]: wrapper.findComponent({ ref: cur }).findComponent({ ref: 'field' })
        .vm,
    }),
    {}
  );

  const form = formRef.form;
  const fields = Object.keys(fieldRefs).reduce(
    (prev, cur) => ({
      ...prev,
      [cur]: fieldRefs[cur].field,
    }),
    {}
  );

  return {
    wrapper,
    formRef,
    form,
    fieldRefs,
    fields,
  };
};
