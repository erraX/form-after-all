import Vue from 'vue';
import { ref, isReactive } from '@vue/composition-api';
import { mount } from '@vue/test-utils';
import { flushPromises } from '../utils';
import { Form } from '../../src/components';
import { DEFAULT_INITIAL_STATE } from '../../src/components/Field';
import useField from '../../src/hooks/useField';
import FieldState from '../FieldState';

const createFormWrapper = (propsData) => {
  const wrapper = mount(
    {
      components: { Form, FieldState },
      template: `<Form ref="form"><FieldState ref="fieldState" v-bind="$props" /></Form>`,
      props: FieldState.props,
    },
    {
      propsData: propsData,
    }
  );

  const formRef = wrapper.findComponent({ ref: 'form' }).vm;
  const fieldRef = wrapper
    .findComponent({ ref: 'fieldState' })
    .findComponent({ ref: 'field' }).vm;

  const form = formRef.form;
  const field = fieldRef.field;

  return {
    wrapper,
    formRef,
    form,
    fieldRef,
    field,
  };
};

describe('useField', () => {
  it('return `field` is reactive', () => {
    const { field } = createFormWrapper({ fieldPath: 'foo' });
    expect(isReactive(field)).toBe(true);
  });

  it('should initialize with default `initialState`', () => {
    const { wrapper } = createFormWrapper({ fieldPath: 'foo' });

    // `undefined`, `null` will be rendered as ""
    expect(wrapper.find('.value').text()).toBe('');
    expect(wrapper.find('.touched').text()).toBe(
      String(DEFAULT_INITIAL_STATE.touched)
    );
    expect(wrapper.find('.error').text()).toBe(
      String(DEFAULT_INITIAL_STATE.error)
    );
    expect(wrapper.find('.active').text()).toBe(
      String(DEFAULT_INITIAL_STATE.active)
    );
    expect(wrapper.find('.editable').text()).toBe(
      String(DEFAULT_INITIAL_STATE.editable)
    );
    expect(wrapper.find('.visible').text()).toBe(
      String(DEFAULT_INITIAL_STATE.visible)
    );
  });

  it('should initialize with custom `initialState`', () => {
    const { wrapper } = createFormWrapper({
      fieldPath: 'foo',
      initialState: {
        value: 'foo',
        touched: true,
        error: 'foo is error',
        active: false,
        editable: false,
        visible: false,
      },
    });

    expect(wrapper.find('.value').text()).toBe('foo');
    expect(wrapper.find('.touched').text()).toBe('true');
    expect(wrapper.find('.error').text()).toBe('foo is error');
    expect(wrapper.find('.active').text()).toBe('false');
    expect(wrapper.find('.editable').text()).toBe('false');
    expect(wrapper.find('.visible').text()).toBe('false');
  });

  describe('useField#setValue', () => {
    it('should work', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });

    it('should working with deep key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { value: 'foo.bar' },
      });

      expect(wrapper.find('.value').text()).toBe('foo.bar');

      field.setValue('next foo.bar');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo.bar');
    });

    it('should working with array key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo[0]',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });

    it('should working with arbitrary array key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo[1]',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });
  });

  describe('useField#setTouched', () => {
    it('should work with no default touched specified', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.touched').text()).toBe('false');

      field.setTouched(true);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('true');
    });

    it('should work with default touched', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { touched: false },
      });

      expect(wrapper.find('.touched').text()).toBe('false');

      field.setTouched(true);
      await Vue.nextTick();

      expect(wrapper.find('.touched').text()).toBe('true');
    });

    it('should working with deep key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { touched: false },
      });

      expect(wrapper.find('.touched').text()).toBe('false');

      field.setTouched(true);
      await Vue.nextTick();

      expect(wrapper.find('.touched').text()).toBe('true');
    });
  });

  describe('useField#setError', () => {
    it('should work with no default error specified', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.error').text()).toBe('');

      field.setError('error');
      await Vue.nextTick();

      expect(wrapper.find('.error').text()).toBe('error');
    });

    it('should work with default error', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { error: 'error' },
      });

      expect(wrapper.find('.error').text()).toBe('error');

      field.setError('');
      await Vue.nextTick();

      expect(wrapper.find('.error').text()).toBe('');
    });

    it('should working with deep key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { error: 'error' },
      });

      expect(wrapper.find('.error').text()).toBe('error');

      field.setError('');
      await Vue.nextTick();

      expect(wrapper.find('.error').text()).toBe('');
    });
  });

  describe('useField#setActive', () => {
    it('should work with no default active specified', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('false');
    });

    it('should work with default active', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { active: false },
      });

      expect(wrapper.find('.active').text()).toBe('false');

      field.setActive(true);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('true');
    });

    it('should working with deep key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { active: false },
      });

      expect(wrapper.find('.active').text()).toBe('false');

      field.setActive(true);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('true');
    });

    it('should restore to default value when become inactive and `restoreWhenBecomeInactive` is `true`', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        defaultValue: 'default foo',
        restoreWhenBecomeInactive: true,
        initialState: {
          value: 'foo',
          active: true,
        },
      });

      expect(wrapper.find('.value').text()).toBe('foo');
      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('default foo');
      expect(wrapper.find('.active').text()).toBe('false');
    });

    it('should not restore to default value when become inactive and `restoreWhenBecomeInactive` is `false`', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        defaultValue: 'default foo',
        restoreWhenBecomeInactive: false,
        initialState: {
          value: 'foo',
          active: true,
        },
      });

      expect(wrapper.find('.value').text()).toBe('foo');
      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('foo');
      expect(wrapper.find('.active').text()).toBe('false');
    });

    it('should restore to custom default value when become inactive and `restoreWhenBecomeInactive` is `true`', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        defaultValue: 'default foo',
        restoreWhenBecomeInactive: true,
        initialState: {
          value: 'foo',
          active: true,
        },
      });

      expect(wrapper.find('.value').text()).toBe('foo');
      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false, true, 'custom foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('custom foo');
      expect(wrapper.find('.active').text()).toBe('false');
    });

    it('should toggle active status by `activeWhen`', async () => {
      const isActive = ref(false);
      const { wrapper } = createFormWrapper({
        fieldPath: 'foo',
        activeWhen: () => isActive.value,
        initialState: { active: false },
      });

      expect(wrapper.find('.active').text()).toBe('false');

      isActive.value = true;
      await flushPromises();

      expect(wrapper.find('.active').text()).toBe('true');
    });

    it('`activeWhen` should not override `initialState.active` on initialize', () => {
      const { wrapper: wrapperFoo } = createFormWrapper({
        fieldPath: 'foo',
        activeWhen: () => false,
        initialState: { active: true },
      });

      const { wrapper: wrapperBar } = createFormWrapper({
        fieldPath: 'bar',
        activeWhen: () => true,
        initialState: { active: false },
      });

      expect(wrapperFoo.find('.active').text()).toBe('true');
      expect(wrapperBar.find('.active').text()).toBe('false');
    });
  });

  describe('useField#setEditable', () => {
    it('should work with no default editable specified', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.editable').text()).toBe('true');

      field.setEditable(false);
      await Vue.nextTick();

      expect(wrapper.find('.editable').text()).toBe('false');
    });

    it('should work with default editable', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { editable: false },
      });

      expect(wrapper.find('.editable').text()).toBe('false');

      field.setEditable(true);
      await Vue.nextTick();

      expect(wrapper.find('.editable').text()).toBe('true');
    });

    it('should working with deep key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { editable: false },
      });

      expect(wrapper.find('.editable').text()).toBe('false');

      field.setEditable(true);
      await Vue.nextTick();

      expect(wrapper.find('.editable').text()).toBe('true');
    });

    it('should toggle editable status by `editableWhen`', async () => {
      const isEditable = ref(false);
      const { wrapper } = createFormWrapper({
        fieldPath: 'foo',
        editableWhen: () => isEditable.value,
        initialState: { editable: false },
      });

      expect(wrapper.find('.editable').text()).toBe('false');

      isEditable.value = true;
      await flushPromises();

      expect(wrapper.find('.editable').text()).toBe('true');
    });

    it('`editableWhen` should not override `initialState.editable` on initialize', () => {
      const { wrapper: wrapperFoo } = createFormWrapper({
        fieldPath: 'foo',
        editableWhen: () => false,
        initialState: { editable: true },
      });

      const { wrapper: wrapperBar } = createFormWrapper({
        fieldPath: 'bar',
        editableWhen: () => true,
        initialState: { editable: false },
      });

      expect(wrapperFoo.find('.editable').text()).toBe('true');
      expect(wrapperBar.find('.editable').text()).toBe('false');
    });
  });

  describe('useField#setVisible', () => {
    it('should work with no default visible specified', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' },
      });

      expect(wrapper.find('.visible').text()).toBe('true');

      field.setVisible(false);
      await Vue.nextTick();

      expect(wrapper.find('.visible').text()).toBe('false');
    });

    it('should work with default visible', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { visible: false },
      });

      expect(wrapper.find('.visible').text()).toBe('false');

      field.setVisible(true);
      await Vue.nextTick();

      expect(wrapper.find('.visible').text()).toBe('true');
    });

    it('should working with deep key', async () => {
      const { wrapper, field } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { visible: false },
      });

      expect(wrapper.find('.visible').text()).toBe('false');

      field.setVisible(true);
      await Vue.nextTick();

      expect(wrapper.find('.visible').text()).toBe('true');
    });

    it('should toggle visible status by `visibleWhen`', async () => {
      const isVisible = ref(false);
      const { wrapper } = createFormWrapper({
        fieldPath: 'foo',
        visibleWhen: () => isVisible.value,
        initialState: { visible: false },
      });

      expect(wrapper.find('.visible').text()).toBe('false');

      isVisible.value = true;
      await flushPromises();

      expect(wrapper.find('.visible').text()).toBe('true');
    });

    it('`visibleWhen` should not override `initialState.visible` on initialize', () => {
      const { wrapper: wrapperFoo } = createFormWrapper({
        fieldPath: 'foo',
        visibleWhen: () => false,
        initialState: { visible: true },
      });

      const { wrapper: wrapperBar } = createFormWrapper({
        fieldPath: 'bar',
        visibleWhen: () => true,
        initialState: { visible: false },
      });

      expect(wrapperFoo.find('.visible').text()).toBe('true');
      expect(wrapperBar.find('.visible').text()).toBe('false');
    });
  });
});
