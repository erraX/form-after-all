import { mount } from '@vue/test-utils';
import useForm from '../../src/hooks/useForm';
import { DEFAULT_INITIAL_STATE } from '../../src/components/Field';
import { Form } from '../../src/components';
import FieldState from '../FieldState';

const createFormWrapper = (propsData) => {
  const wrapper = mount(
    {
      components: { Form, FieldState },
      template: `
        <Form ref="form" v-bind="formProps">
          <FieldState
            v-for="field in fields"
            :key="field.fieldPath"
            :ref="'field_' + field.fieldPath"
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
      [cur]: wrapper
        .findComponent({ ref: `field_${cur}` })
        .findComponent({ ref: 'field' }).vm,
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

describe('useForm', () => {
  describe('useForm - values', () => {
    it('should `values` is empty object when `initialState` is empty', () => {
      const { form } = createFormWrapper({
        fields: [{ fieldPath: 'foo' }, { fieldPath: 'bar.a' }],
      });
      expect(form.values).toEqual({});
    });

    it('should `values` is initialized by `initialState`', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
              b: ['b'],
              bar: {
                a: 'bar.a',
              },
            },
          },
        },
        fields: [
          { fieldPath: 'foo' },
          { fieldPath: 'bar.a' },
          { fieldPath: 'b[0]' },
        ],
      });
      expect(form.values).toEqual({
        foo: 'foo',
        b: ['b'],
        bar: {
          a: 'bar.a',
        },
      });
    });

    it('should `values` includes any `initialState.value` which not defined with `useField`', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
              a: 'a',
            },
          },
        },
        fields: [{ fieldPath: 'foo' }],
      });
      expect(form.values).toEqual({
        foo: 'foo',
        a: 'a',
      });
    });

    it("should form's `initialState.value` override field `initialState.value`", () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
            },
          },
        },
        fields: [
          { fieldPath: 'foo', props: { initialState: { value: 'foo value' } } },
        ],
      });
      expect(form.values).toEqual({
        foo: 'foo',
      });
    });

    it("should using field `initialState.value` when form's `initialState.value` is `undefined`", () => {
      const { form } = createFormWrapper({
        fields: [
          { fieldPath: 'foo', props: { initialState: { value: 'foo value' } } },
        ],
      });
      expect(form.values).toEqual({ foo: 'foo value' });
    });
  });

  it("should `touched`, `error`, `active`, `editable`, `visible` is same shape as fields's `fieldPath`", () => {
    const { form } = createFormWrapper({
      fields: [
        { fieldPath: 'foo' },
        { fieldPath: 'bar.a' },
        { fieldPath: 'b[0]' },
        { fieldPath: 'c.d[1]' },
      ],
    });

    const defaultTouched = DEFAULT_INITIAL_STATE.touched;
    expect(form.touched).toEqual({
      foo: defaultTouched,
      bar: { a: defaultTouched },
      b: [defaultTouched],
      c: { d: [undefined, defaultTouched] },
    });

    const defaultError = DEFAULT_INITIAL_STATE.error;
    expect(form.error).toEqual({
      foo: defaultError,
      bar: { a: defaultError },
      b: [defaultError],
      c: { d: [undefined, defaultError] },
    });

    const defaultActive = DEFAULT_INITIAL_STATE.active;
    expect(form.active).toEqual({
      foo: defaultActive,
      bar: { a: defaultActive },
      b: [defaultActive],
      c: { d: [undefined, defaultActive] },
    });

    const defaultEditable = DEFAULT_INITIAL_STATE.editable;
    expect(form.editable).toEqual({
      foo: defaultEditable,
      bar: { a: defaultEditable },
      b: [defaultEditable],
      c: { d: [undefined, defaultEditable] },
    });

    const defaultVisible = DEFAULT_INITIAL_STATE.visible;
    expect(form.visible).toEqual({
      foo: defaultVisible,
      bar: { a: defaultVisible },
      b: [defaultVisible],
      c: { d: [undefined, defaultVisible] },
    });
  });
});
