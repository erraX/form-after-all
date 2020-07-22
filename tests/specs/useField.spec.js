import Vue from 'vue';
import { mount } from '@vue/test-utils';
import { Form } from '../../src/components';
import { DEFAULT_INITIAL_STATE } from '../../src/components/Field';
import useField from '../../src/hooks/useField';
import FieldState from '../FieldState';

const getField = (wrapper) =>
  wrapper.findComponent({ ref: 'fieldState' }).findComponent({ ref: 'field' })
    .vm.field;

describe('useField', () => {
  it('should initialize with default `initialState`', () => {
    const wrapper = mount({
      components: { Form, FieldState },
      template: ` <Form><FieldState fieldPath="foo" /></Form> `,
    });

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
    const wrapper = mount({
      components: { Form, FieldState },
      template: `
        <Form>
          <FieldState
            fieldPath="foo"
            :initialState="{
              value: 'foo',
              touched: true,
              error: 'foo is error',
              active: false,
              editable: false,
              visible: false,
            }"
          />
        </Form>
      `,
    });

    expect(wrapper.find('.value').text()).toBe('foo');
    expect(wrapper.find('.touched').text()).toBe('true');
    expect(wrapper.find('.error').text()).toBe('foo is error');
    expect(wrapper.find('.active').text()).toBe('false');
    expect(wrapper.find('.editable').text()).toBe('false');
    expect(wrapper.find('.visible').text()).toBe('false');
  });

  describe('useField#setValue', () => {
    it('`setValue` should work', async () => {
      const wrapper = mount({
        components: { Form, FieldState },
        template: `
          <Form ref="form">
            <FieldState
              ref="fieldState"
              fieldPath="foo"
              :initialState="{ value: 'foo' }"
            />
          </Form>
        `,
      });

      const field = getField(wrapper);

      expect(wrapper.find('.value').text()).toBe('foo');

      field.setValue('next foo');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo');
    });

    it('`setValue` should working with deep key', async () => {
      const wrapper = mount({
        components: { Form, FieldState },
        template: `
        <Form>
          <FieldState
            ref="fieldState"
            fieldPath="foo.bar"
            :initialState="{ value: 'foo.bar' }"
          />
        </Form>
      `,
      });

      const field = getField(wrapper);

      expect(wrapper.find('.value').text()).toBe('foo.bar');

      field.setValue('next foo.bar');
      await Vue.nextTick();

      expect(wrapper.find('.value').text()).toBe('next foo.bar');
    });
  });

  describe('useField#setActive', () => {
    it('`setActive` should work', async () => {
      const wrapper = mount({
        components: { Form, FieldState },
        template: `
        <Form>
          <FieldState
            ref="fieldState"
            fieldPath="foo"
            :initialState="{ value: 'foo' }"
          />
        </Form>
      `,
      });

      const field = getField(wrapper);

      expect(wrapper.find('.active').text()).toBe('true');

      field.setActive(false);
      await Vue.nextTick();

      expect(wrapper.find('.active').text()).toBe('false');
    });
  });
});
