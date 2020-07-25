import useForm from '../../src/hooks/useForm';
import createFormWrapper from '../createFormWrapper';

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
