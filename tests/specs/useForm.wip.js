import Vue from 'vue';
import { ref, watch, computed } from '@vue/composition-api';
import { get } from 'lodash-es';
import useForm from '../../src/hooks/useForm';

describe('useForm', () => {
  it('should work when `initialState` is empty', () => {
    let form = useForm({
      initialState: {},
    });

    expect(form.values.value).toEqual({});
    expect(form.touched.value).toEqual({});
    expect(form.errors.value).toEqual({});
    expect(form.actives.value).toEqual({});
    expect(form.editable.value).toEqual({});
    expect(form.visible.value).toEqual({});

    form = useForm({});
    expect(form.values.value).toEqual({});
    expect(form.touched.value).toEqual({});
    expect(form.errors.value).toEqual({});
    expect(form.actives.value).toEqual({});
    expect(form.editable.value).toEqual({});
    expect(form.visible.value).toEqual({});

    form = useForm();
    expect(form.values.value).toEqual({});
    expect(form.touched.value).toEqual({});
    expect(form.errors.value).toEqual({});
    expect(form.actives.value).toEqual({});
    expect(form.editable.value).toEqual({});
    expect(form.visible.value).toEqual({});
  });

  it('should initialize by `initialState`', () => {
    const form = useForm({
      initialState: {
        values: { a: 1 },
        touched: { a: true },
        errors: { a: 'error' },
        actives: { a: true },
        editable: { a: false },
        visible: { a: false },
      },
    });
    expect(form.values.value).toEqual({ a: 1 });
    expect(form.touched.value).toEqual({ a: true });
    expect(form.errors.value).toEqual({ a: 'error' });
    expect(form.actives.value).toEqual({ a: true });
    expect(form.editable.value).toEqual({ a: false });
    expect(form.visible.value).toEqual({ a: false });
  });

  describe('reinitialize', () => {
    const createForm = (initialState) => {
      const cbValue = jest.fn();
      const cbTouched = jest.fn();
      const cbError = jest.fn();
      const cbActive = jest.fn();
      const cbEditable = jest.fn();
      const cbVisible = jest.fn();

      const form = useForm({
        initialState: {
          ...initialState,
          values: { a: '1' },
          touched: { a: true },
          errors: { a: 'error' },
          actives: { a: true },
          editable: { a: true },
          visible: { a: true },
        },
      });

      watch(() => form.values.value.a, cbValue);
      watch(() => form.touched.value.a, cbTouched);
      watch(() => form.errors.value.a, cbError);
      watch(() => form.actives.value.a, cbActive);
      watch(() => form.editable.value.a, cbEditable);
      watch(() => form.visible.value.a, cbVisible);

      return {
        form,
        cbValue,
        cbTouched,
        cbError,
        cbActive,
        cbEditable,
        cbVisible,
      };
    };

    it('should reinitialize with new states', async () => {
      const {
        form,
        cbValue,
        cbTouched,
        cbError,
        cbActive,
        cbEditable,
        cbVisible,
      } = createForm();

      form.reinitialize({
        values: { a: '2' },
        touched: { a: false },
        errors: { a: 'none' },
        actives: { a: false },
        editable: { a: false },
        visible: { a: false },
      });

      expect(form.values.value).toEqual({ a: '2' });
      expect(form.touched.value).toEqual({ a: false });
      expect(form.errors.value).toEqual({ a: 'none' });
      expect(form.actives.value).toEqual({ a: false });
      expect(form.editable.value).toEqual({ a: false });
      expect(form.visible.value).toEqual({ a: false });

      await Vue.nextTick();

      expect(cbValue).toHaveBeenCalledTimes(2);
      expect(cbTouched).toHaveBeenCalledTimes(2);
      expect(cbError).toHaveBeenCalledTimes(2);
      expect(cbActive).toHaveBeenCalledTimes(2);
      expect(cbEditable).toHaveBeenCalledTimes(2);
      expect(cbVisible).toHaveBeenCalledTimes(2);

      expect(cbValue.mock.calls[1][0]).toBe('2');
      expect(cbTouched.mock.calls[1][0]).toBe(false);
      expect(cbError.mock.calls[1][0]).toBe('none');
      expect(cbActive.mock.calls[1][0]).toBe(false);
      expect(cbEditable.mock.calls[1][0]).toBe(false);
      expect(cbActive.mock.calls[1][0]).toBe(false);
    });

    it('should reinitialize with old states', async () => {
      const {
        form,
        cbValue,
        cbTouched,
        cbError,
        cbActive,
        cbEditable,
        cbVisible,
      } = createForm({
        values: { a: '1' },
        touched: { a: true },
        errors: { a: 'error' },
        actives: { a: true },
        editable: { a: true },
        visible: { a: true },
      });

      form.values.value.a = '2';
      form.touched.value.a = false;
      form.errors.value.a = 'none';
      form.actives.value.a = false;
      form.editable.value.a = false;
      form.visible.value.a = false;

      await Vue.nextTick();

      form.reinitialize();

      await Vue.nextTick();

      expect(cbValue).toHaveBeenCalledTimes(3);
      expect(cbTouched).toHaveBeenCalledTimes(3);
      expect(cbError).toHaveBeenCalledTimes(3);
      expect(cbActive).toHaveBeenCalledTimes(3);
      expect(cbEditable).toHaveBeenCalledTimes(3);
      expect(cbVisible).toHaveBeenCalledTimes(3);

      expect(form.actives.value).toEqual({ a: true });
      expect(form.editable.value).toEqual({ a: true });
      expect(form.visible.value).toEqual({ a: true });

      expect(cbValue.mock.calls[2][0]).toBe('1');
      expect(cbTouched.mock.calls[2][0]).toBe(true);
      expect(cbError.mock.calls[2][0]).toBe('error');
      expect(cbActive.mock.calls[2][0]).toBe(true);
      expect(cbEditable.mock.calls[2][0]).toBe(true);
      expect(cbVisible.mock.calls[2][0]).toBe(true);
    });
  });

  it('should reinitialize when `initialState` changed', async () => {
    const initialState = ref({
      values: { a: { b: '' } },
      touched: { a: { b: true } },
    });
    const form = useForm({
      initialState,
    });

    expect(form.values.value).toEqual({ a: { b: '' } });
    expect(form.touched.value).toEqual({ a: { b: true } });

    form.setFieldTouched('a.b', false);
    expect(form.touched.value).toEqual({ a: { b: false } });
    initialState.value = {
      values: { a: { b: 'bb' } },
    };

    await Vue.nextTick();

    expect(form.values.value).toEqual({ a: { b: 'bb' } });
    expect(form.touched.value).toEqual({ a: { b: true } });

    form.setFieldValue('a.b', 'next bb');
    expect(form.values.value).toEqual({ a: { b: 'next bb' } });
    form.reinitialize();
    expect(form.values.value).toEqual({ a: { b: 'bb' } });
  });

  it('should dirty when current `values` is not deep equal to `initialValues`', () => {
    const form = useForm({
      initialState: {
        values: {
          a: {
            b: {
              foo: 'foo',
            },
          },
        },
      },
    });

    expect(form.dirty.value).toBe(false);

    form.values.value.a = { b: { foo: 'foo' } };
    expect(form.dirty.value).toBe(false);

    Vue.set(form.values.value.a, 'c', 'cc');
    expect(form.dirty.value).toBe(true);
  });

  describe('state helpers', () => {
    it('should setState', () => {
      const form = useForm({
        initialState: {
          values: { a: { b: '1' } },
        },
      });

      const deepValue = computed(() =>
        get(form.values.value, 'a.b', 'default')
      );
      expect(deepValue.value).toBe('1');
      form.setValues({
        a: { b: '2' },
      });
      expect(deepValue.value).toBe('2');
    });

    it('should setState when previous property is not exists', () => {
      const form = useForm();

      const deepValue = computed(() =>
        get(form.values.value, 'a.b', 'default')
      );
      expect(deepValue.value).toBe('default');
      form.setValues({
        a: { b: '2' },
      });
      expect(deepValue.value).toBe('2');
    });

    describe('setFieldState', () => {
      it('should deep set object state', () => {
        const form = useForm();
        const deepValue = computed(() =>
          get(form.values.value, 'a.b.c', 'default')
        );

        expect(deepValue.value).toBe('default');

        form.setFieldValue('a.b.c', 'haha');
        expect(deepValue.value).toBe('haha');
      });

      it('should should deep set array state', () => {
        const form = useForm();
        const deepValue = computed(() =>
          get(form.values.value, 'a.b.d[1].name', 'default')
        );

        expect(deepValue.value).toBe('default');

        form.setFieldValue('a.b.d[1].name', 'haha');
        expect(deepValue.value).toBe('haha');

        expect(form.values.value.a.b.d[0]).toBeUndefined();
        expect(Array.isArray(form.values.value.a.b.d)).toBe(true);
      });

      it('should set existing property', () => {
        const form = useForm({
          initialState: {
            values: { a: { b: '1' } },
          },
        });
        const deepValue = computed(() => get(form.values.value, 'a.b'));
        expect(deepValue.value).toBe('1');
        form.setFieldValue('a.b', 'haha');
        expect(deepValue.value).toBe('haha');
      });
    });

    describe('deleteFieldState', () => {
      it('should deep delete object property', () => {
        const form = useForm({
          initialState: {
            values: { a: { b: '1' } },
          },
        });
        const deepValue = computed(() =>
          get(form.values.value, 'a.b', 'default')
        );
        expect(deepValue.value).toBe('1');
        form.deleteFieldValue('a.b');
        expect(deepValue.value).toBe('default');
      });

      it('should deep delete array item', () => {
        const form = useForm({
          initialState: {
            values: {
              a: {
                b: [{ name: 'name', age: 'age' }],
              },
            },
          },
        });
        const name = computed(() =>
          get(form.values.value, 'a.b[0].name', 'default')
        );
        const age = computed(() =>
          get(form.values.value, 'a.b[0].age', 'default')
        );
        const arr = computed(() => get(form.values.value, 'a.b', 'default'));

        expect(name.value).toBe('name');
        expect(age.value).toBe('age');
        expect(arr.value).toEqual([{ name: 'name', age: 'age' }]);

        form.deleteFieldValue('a.b[0].name');
        expect(name.value).toBe('default');
        expect(age.value).toBe('age');

        form.deleteFieldValue('a.b[0]');
        expect(name.value).toBe('default');
        expect(age.value).toBe('default');
        expect(arr.value).toEqual([]);
      });
    });
  });

  describe('active', () => {
    it('should restore to default value when field become inactive', () => {
      const form = useForm({
        initialState: {
          values: {
            a: 'a',
          },
        },
      });

      form.setFieldActive('a', false, false, 'default a');
      expect(form.values.value.a).toBe('a');

      form.setFieldActive('a', false, true, 'default a');
      expect(form.values.value.a).toBe('default a');
    });

    it('should not restore to default value when field become active', () => {
      const form = useForm({
        initialState: {
          values: {
            a: 'a',
          },
        },
      });

      form.setFieldActive('a', true, true, 'default a');
      expect(form.values.value.a).toBe('a');
    });
  });

  it('should not restore to default value when `shouldRestore` is false', () => {
    const form = useForm({
      initialState: {
        values: {
          a: 'a',
        },
      },
    });

    form.setFieldActive('a', false, false, 'default a');
    expect(form.values.value.a).toBe('a');
  });

  describe('activeValues', () => {
    it('should filter inactive values', () => {
      const form = useForm({
        initialState: {
          values: {
            a: {
              b: [
                { name: 'name1', age: 'age1' },
                { name: 'name2', age: 'age2' },
              ],
            },
          },
        },
      });

      form.registerField('a.b[0].name', {
        active: { value: false },
      });

      expect(form.activeValues.value).toEqual({
        a: {
          b: [{ age: 'age1' }, { name: 'name2', age: 'age2' }],
        },
      });

      form.registerField('a.b[0].age', {
        active: { value: false },
      });

      expect(form.activeValues.value).toEqual({
        a: {
          b: [{ name: 'name2', age: 'age2' }],
        },
      });

      form.registerField('a.b', {
        active: { value: false },
      });

      expect(form.activeValues.value).toEqual({
        a: {},
      });
    });
  });

  describe('deleteState', () => {
    it('should delete deep state', () => {
      const form = useForm({
        initialState: {
          touched: {
            a: {
              b: [
                { name: true, age: false },
                { name: true, age: false },
              ],
            },
          },
        },
      });

      form.deleteFieldTouched('a.b[0].name');
      expect(form.touched.value).toEqual({
        a: {
          b: [{ age: false }, { name: true, age: false }],
        },
      });

      form.deleteFieldTouched('a.b[0].age');
      expect(form.touched.value).toEqual({
        a: {
          b: [{}, { name: true, age: false }],
        },
      });

      form.deleteFieldTouched('a.b[0]');
      expect(form.touched.value).toEqual({
        a: {
          b: [{ name: true, age: false }],
        },
      });
    });
  });
});
