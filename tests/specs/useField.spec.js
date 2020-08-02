import { ref, isReactive } from '@vue/composition-api';
import { flushPromises } from '../utils';
import useField from '../../src/hooks/useField';
import createFormWrapper from '../createFormWrapper';

describe('useField', () => {
  it('return `field` is reactive', () => {
    const { fields } = createFormWrapper({
      fields: [{ fieldPath: 'foo' }],
    });
    expect(isReactive(fields.foo)).toBe(true);
  });

  describe('initialState', () => {
    it('should initialize with form `initialState`', () => {
      const { fields } = createFormWrapper({
        formProps: {
          initialState: {
            values: { foo: 'foo' },
            error: { foo: 'error' },
            touched: { foo: true },
            active: { foo: true },
            editable: { foo: true },
            visible: { foo: true },
          },
        },
        fields: [{ fieldPath: 'foo' }],
      });

      const field = fields.foo;

      expect(field.value).toBe('foo');
      expect(field.error).toBe('error');
      expect(field.touched).toBe(true);
      expect(field.active).toBe(true);
      expect(field.editable).toBe(true);
      expect(field.visible).toBe(true);
    });
  });

  it('should using field initial `touched` and `error` when form `initialState` is `undefined`', () => {
    const { form, fields } = createFormWrapper({
      fields: [
        {
          fieldPath: 'foo',
          props: {
            initialTouched: true,
            initialError: 'error',
          },
        },
      ],
    });
    const field = fields.foo;

    expect(field.touched).toBe(true);
    expect(field.error).toBe('error');

    expect(form.touched).toEqual({ foo: true });
    expect(form.error).toEqual({ foo: 'error' });
  });

  it('should set `active`, `editable`, `visible` state when `*When` not exists', () => {
    const { form, fields } = createFormWrapper({
      fields: [{ fieldPath: 'foo' }],
    });
    const field = fields.foo;

    expect(field.active).toBe(true);
    expect(field.editable).toBe(true);
    expect(field.visible).toBe(true);

    expect(form.active).toEqual({ foo: true });
    expect(form.editable).toEqual({ foo: true });
    expect(form.visible).toEqual({ foo: true });
  });

  it('should set `active`, `editable`, `visible` state by `*When` result', () => {
    const { form, fields } = createFormWrapper({
      formProps: {
        initialState: {
          active: { foo: false },
          editable: { foo: false },
          visible: { foo: false },
        },
      },
      fields: [
        {
          fieldPath: 'foo',
          props: {
            activeWhen: () => true,
            editableWhen: () => true,
            visibleWhen: () => true,
          },
        },
      ],
    });
    const field = fields.foo;

    expect(field.active).toBe(true);
    expect(field.editable).toBe(true);
    expect(field.visible).toBe(true);

    expect(form.active).toEqual({ foo: true });
    expect(form.editable).toEqual({ foo: true });
    expect(form.visible).toEqual({ foo: true });
  });

  it('should set `active`, `editable`, `visible` array state by `*When` result', () => {
    const { form, fields } = createFormWrapper({
      formProps: {
        initialState: {
          active: { arr: [false] },
          editable: { arr: [false] },
          visible: { arr: [false] },
        },
      },
      fields: [
        {
          fieldPath: 'arr[0]',
          props: {
            activeWhen: () => true,
            editableWhen: () => true,
            visibleWhen: () => true,
          },
        },
      ],
    });
    const field = fields['arr[0]'];

    expect(field.active).toBe(true);
    expect(field.editable).toBe(true);
    expect(field.visible).toBe(true);

    expect(form.active).toEqual({ arr: [true] });
    expect(form.editable).toEqual({ arr: [true] });
    expect(form.visible).toEqual({ arr: [true] });
  });

  describe('useField#setValue', () => {
    it('should work', () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo' }],
      });

      const field = fields.foo;
      field.setValue('next foo');
      expect(field.value).toBe('next foo');
      expect(form.values).toEqual({ foo: 'next foo' });
    });

    it('should working with deep key', () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo.bar' }],
      });

      const field = fields['foo.bar'];

      field.setValue('next foo.bar');
      expect(field.value).toBe('next foo.bar');
      expect(form.values).toEqual({ foo: { bar: 'next foo.bar' } });
    });

    it('should working with array key', () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo[0]' }],
      });

      const field = fields['foo[0]'];

      field.setValue('next foo');
      expect(field.value).toBe('next foo');
      expect(form.values).toEqual({ foo: ['next foo'] });
    });

    it('should working with arbitrary array key', async () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo[1]' }],
      });

      const field = fields['foo[1]'];

      field.setValue('next foo');
      expect(field.value).toBe('next foo');
      expect(form.values).toEqual({ foo: [undefined, 'next foo'] });
    });
  });

  describe('useField#setTouched', () => {
    it('should working with deep key', () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo.bar' }],
      });

      const field = fields['foo.bar'];

      field.setTouched(true);
      expect(field.touched).toBe(true);
      expect(form.touched).toEqual({
        foo: { bar: true },
      });

      field.setTouched(false);
      expect(field.touched).toBe(false);
      expect(form.touched).toEqual({
        foo: { bar: false },
      });
    });
  });

  describe('useField#setError', () => {
    it('should working with deep key', () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo.bar' }],
      });

      const field = fields['foo.bar'];

      field.setError('');
      expect(field.error).toBe('');
      expect(form.error).toEqual({
        foo: { bar: '' },
      });

      field.setError('error');
      expect(field.error).toBe('error');
      expect(form.error).toEqual({
        foo: { bar: 'error' },
      });
    });
  });

  describe('useField#setActive', () => {
    it('should working with deep key', () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo.bar' }],
      });

      const field = fields['foo.bar'];

      field.setActive(true);
      expect(field.active).toBe(true);
      expect(form.active).toEqual({
        foo: { bar: true },
      });

      field.setActive(false);
      expect(field.active).toBe(false);
      expect(form.active).toEqual({
        foo: { bar: false },
      });
    });

    it('should restore to default value when become inactive and `restoreWhenBecomeInactive` is `true`', () => {
      const { form, fields } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
            },
          },
        },
        fields: [
          {
            fieldPath: 'foo',
            props: {
              defaultValue: 'default foo',
              restoreWhenBecomeInactive: true,
            },
          },
        ],
      });

      const field = fields.foo;

      field.setActive(false);
      expect(field.value).toBe('default foo');
      expect(form.values).toEqual({
        foo: 'default foo',
      });
    });

    it('should not restore to default value when become inactive and `restoreWhenBecomeInactive` is `false`', () => {
      const { form, fields } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
            },
          },
        },
        fields: [
          {
            fieldPath: 'foo',
            props: {
              defaultValue: 'default foo',
              restoreWhenBecomeInactive: false,
            },
          },
        ],
      });

      const field = fields.foo;

      field.setActive(false);
      expect(field.value).toBe('foo');
      expect(form.values).toEqual({
        foo: 'foo',
      });
    });

    it('should restore to custom default value when become inactive and `restoreWhenBecomeInactive` is `true`', () => {
      const { form, fields } = createFormWrapper({
        formProps: {
          initialState: {
            values: {
              foo: 'foo',
            },
          },
        },
        fields: [
          {
            fieldPath: 'foo',
            props: {
              defaultValue: 'default foo',
              restoreWhenBecomeInactive: false,
            },
          },
        ],
      });

      const field = fields.foo;

      field.setActive(false, true, 'custom foo');
      expect(field.value).toBe('custom foo');
      expect(form.values).toEqual({
        foo: 'custom foo',
      });
    });

    it('should toggle active status by `activeWhen`', async () => {
      const isActive = ref(false);
      const { form, fields } = createFormWrapper({
        fields: [
          {
            fieldPath: 'foo',
            props: {
              activeWhen: () => isActive.value,
            },
          },
        ],
      });
      const field = fields.foo;

      expect(field.active).toBe(false);
      expect(form.active).toEqual({ foo: false });

      isActive.value = true;
      await flushPromises();

      expect(field.active).toBe(true);
      expect(form.active).toEqual({ foo: true });
    });
  });

  describe('useField#setEditable', () => {
    it('should working with deep key', async () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo.bar' }],
      });

      const field = fields['foo.bar'];

      field.setEditable(true);
      expect(field.editable).toBe(true);
      expect(form.editable).toEqual({
        foo: { bar: true },
      });

      field.setEditable(false);
      expect(field.editable).toBe(false);
      expect(form.editable).toEqual({
        foo: { bar: false },
      });
    });

    it('should toggle editable status by `editableWhen`', async () => {
      const isEditable = ref(false);
      const { form, fields } = createFormWrapper({
        fields: [
          {
            fieldPath: 'foo',
            props: {
              editableWhen: () => isEditable.value,
            },
          },
        ],
      });
      const field = fields.foo;

      expect(field.editable).toBe(false);
      expect(form.editable).toEqual({ foo: false });

      isEditable.value = true;
      await flushPromises();

      expect(field.editable).toBe(true);
      expect(form.editable).toEqual({ foo: true });
    });
  });

  describe('useField#setVisible', () => {
    it('should working with deep key', async () => {
      const { form, fields } = createFormWrapper({
        fields: [{ fieldPath: 'foo.bar' }],
      });

      const field = fields['foo.bar'];

      field.setVisible(true);
      expect(field.visible).toBe(true);
      expect(form.visible).toEqual({
        foo: { bar: true },
      });

      field.setVisible(false);
      expect(field.visible).toBe(false);
      expect(form.visible).toEqual({
        foo: { bar: false },
      });
    });

    it('should toggle visible status by `visibleWhen`', async () => {
      const isVisible = ref(false);
      const { form, fields } = createFormWrapper({
        fields: [
          {
            fieldPath: 'foo',
            props: {
              visibleWhen: () => isVisible.value,
            },
          },
        ],
      });
      const field = fields.foo;

      expect(field.visible).toBe(false);
      expect(form.visible).toEqual({ foo: false });

      isVisible.value = true;
      await flushPromises();

      expect(field.visible).toBe(true);
      expect(form.visible).toEqual({ foo: true });
    });
  });
});
