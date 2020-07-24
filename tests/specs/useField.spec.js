import Vue from 'vue';
import { ref } from '@vue/composition-api';
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
      propsData: propsData
    }
  );

  const formRef = wrapper.findComponent({ ref: 'form' }).vm;
  const fieldRef = wrapper
    .findComponent({ ref: 'fieldState' })
    .findComponent({ ref: 'field' })
    .vm;

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
      }
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
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' }
      });

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });

    it('should working with deep key', async () => {
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { value: 'foo.bar' }
      });

      expect(wrapper.find('.value').text()).toBe('foo.bar');

      field.setValue('next foo.bar');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo.bar');
    });

    it('should working with array key', async () => {
      const {
        wrapper,
        field
      } = createFormWrapper({
        fieldPath: 'foo[0]',
        initialState: { value: 'foo' }
      });

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });

    it('should working with arbitrary array key', async () => {
      const {
        wrapper,
        field
      } = createFormWrapper({
        fieldPath: 'foo[1]',
        initialState: { value: 'foo' }
      });

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });
  });

  describe('useField#setActive', () => {
    it('should work with no default active specified', async () => {
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { value: 'foo' }
      });

      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('false');
    });

    it('should work with default active', async () => {
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo',
        initialState: { active: false }
      });

      expect(wrapper.find('.active').text()).toBe('false');

      field.setActive(true);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('true');
    });

    it('should working with deep key', async () => {
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo.bar',
        initialState: { active: false }
      });

      expect(wrapper.find('.active').text()).toBe('false');

      field.setActive(true);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('true');
    });

    it('should restore to default value when become inactive and `restoreWhenBecomeInactive` is `true`', async () => {
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo',
        defaultValue: 'default foo',
        restoreWhenBecomeInactive: true,
        initialState: {
          value: 'foo',
          active: true,
        }
      });

      expect(wrapper.find('.value').text()).toBe('foo');
      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('default foo');
      expect(wrapper.find('.active').text()).toBe('false');
    });

    it('should not restore to default value when become inactive and `restoreWhenBecomeInactive` is `false`', async () => {
      const {
        wrapper,
        field,
      } = createFormWrapper({
        fieldPath: 'foo',
        defaultValue: 'default foo',
        restoreWhenBecomeInactive: false,
        initialState: {
          value: 'foo',
          active: true,
        }
      });

      expect(wrapper.find('.value').text()).toBe('foo');
      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('foo');
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

    it('`activeWhen` should override `initialState.active` on initialize', () => {
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
});
