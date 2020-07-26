import useForm from '../../src/hooks/useForm';
import createFormWrapper from '../createFormWrapper';

describe('useForm', () => {
  describe('useForm#reinitialize', () => {
    it('should reinitialize partial values', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: { foo: 'foo', bar: 'bar' },
            error: { foo: 'foo is error' },
            touched: { foo: true, bar: true },
            editable: { foo: true, bar: true },
            visible: { foo: true, bar: true },
          },
        },
        fields: [{ fieldPath: 'foo' }, { fieldPath: 'bar' }],
      });

      form.setFieldValue('foo', 'tmp');
      form.setFieldError('foo', 'not error');
      form.setFieldTouched('foo', false);
      form.setFieldEditable('foo', false);
      form.setFieldVisible('foo', false);

      expect(form.values).toEqual({ foo: 'tmp', bar: 'bar' });
      expect(form.error).toEqual({ foo: 'not error', bar: '' });
      expect(form.touched).toEqual({ foo: false, bar: true });
      expect(form.editable).toEqual({ foo: false, bar: true });
      expect(form.visible).toEqual({ foo: false, bar: true });

      form.reinitialize({
        values: { foo: 'next foo' },
        touched: { foo: false },
      });

      expect(form.values).toEqual({ foo: 'next foo' });
      expect(form.error).toEqual({ foo: 'foo is error', bar: '' });
      expect(form.touched).toEqual({ foo: false, bar: false });
      expect(form.editable).toEqual({ foo: true, bar: true });
      expect(form.visible).toEqual({ foo: true, bar: true });
    });

    it('should reinitialize active, `restoreWhenBecomeInactive` should work', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: { foo: 'foo', bar: 'bar' },
            active: { foo: true, bar: true },
          },
        },
        fields: [
          { fieldPath: 'foo', props: { defaultValue: 'default foo' } },
          { fieldPath: 'bar' },
        ],
      });

      form.reinitialize({
        values: { foo: 'next foo', bar: 'bar' },
        active: { foo: false },
      });

      expect(form.values).toEqual({ foo: 'default foo', bar: 'bar' });
      expect(form.active).toEqual({ foo: false, bar: true });
    });
  });

  describe('useForm#values', () => {
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

    it('should set touched to `true` when value changed', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: { foo: 'foo', bar: '' },
            touched: { foo: false, bar: false },
          },
        },
        fields: [{ fieldPath: 'foo' }, { fieldPath: 'bar' }],
      });

      form.setFieldValue('foo');

      expect(form.touched).toEqual({ foo: true, bar: false });
    });
  });

  describe('useForm#activeValues', () => {
    it('should without field which is inactive', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
              bar: 'bar',
            },
            active: {
              foo: true,
              bar: false,
            },
          },
        },
        fields: [{ fieldPath: 'foo' }, { fieldPath: 'bar' }],
      });
      expect(form.activeValues).toEqual({ foo: 'foo' });
    });

    it('should remove value in array field which is inactive', () => {
      const { form } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              arr: [1, 2, 3],
            },
            active: {
              arr: [true, true, false],
            },
          },
        },
        fields: [
          { fieldPath: 'arr[0]' },
          { fieldPath: 'arr[1]' },
          { fieldPath: 'arr[2]' },
        ],
      });
      expect(form.activeValues).toEqual({ arr: [1, 2] });
    });
  });

  it('should dirty when values changed', () => {
    const { form } = createFormWrapper({
      formProps: {
        initialState: {
          values: {
            foo: {
              bar: 'foo.bar',
            },
            a: [1, 2],
          },
        },
      },
      fields: [{ fieldPath: 'foo.bar' }],
    });

    expect(form.dirty).toBe(false);
    form.setFieldValue('foo.bar', 'foo');
    expect(form.dirty).toBe(true);
  });

  describe('useField - error', () => {});

  describe('useField - active', () => {});

  describe('useField - editable', () => {});

  describe('useField - visible', () => {});

  it("should `touched`, `error`, `active`, `editable`, `visible` is same shape as fields's `fieldPath`", () => {
    const { form } = createFormWrapper({
      fields: [
        { fieldPath: 'foo' },
        { fieldPath: 'bar.a' },
        { fieldPath: 'b[0]' },
        { fieldPath: 'c.d[1]' },
      ],
    });

    expect(form.touched).toEqual({
      foo: false,
      bar: { a: false },
      b: [false],
      c: { d: [undefined, false] },
    });

    expect(form.error).toEqual({
      foo: '',
      bar: { a: '' },
      b: [''],
      c: { d: [undefined, ''] },
    });

    expect(form.active).toEqual({
      foo: true,
      bar: { a: true },
      b: [true],
      c: { d: [undefined, true] },
    });

    expect(form.editable).toEqual({
      foo: true,
      bar: { a: true },
      b: [true],
      c: { d: [undefined, true] },
    });

    expect(form.visible).toEqual({
      foo: true,
      bar: { a: true },
      b: [true],
      c: { d: [undefined, true] },
    });
  });
});
