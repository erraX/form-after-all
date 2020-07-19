import { mount } from '@vue/test-utils';
import useField from '../../src/hooks/useField';

const createField = (options) => ({
  props: {
    name: String,
    field: Object,
  },
  template: `
    <div>
      <span class="value">{{ value }}</span>
      <span class="touched">{{ touched }}</span>
      <span class="error">{{ error }}</span>
      <span class="active">{{ active }}</span>
      <span class="editable">{{ editable }}</span>
      <span class="visible">{{ visible }}</span>
    </div>
  `,
  setup(props) {
    const field = useField(props.name, props.field);
    return {
      ...field,
    };
  },
  ...options,
});

describe('useField', () => {
  it('should initialize with field `initialState` when top level `initialState` is undefined', () => {
    const Field = createField();
    const wrapper = mount({
      components: {
        Form,
        Field,
      },
      template: `
        <Form :initial-state="{
          values: { a: 'top a' },
        }">
          <template #default="{ form }">
            <span class="form-value">{{ JSON.stringify(form.values.value) }}</span>
            <span class="form-touched">{{ JSON.stringify(form.touched.value) }}</span>
            <Field
              name="a"
              :field="{
                initialState: {
                  value: 'aaaa',
                  touched: true,
                  error: 'error',
                  active: false,
                  editable: false,
                  visible: false,
                }
              }"
            />
          </template>
        </Form>
      `,
    });

    expect(wrapper.find('.form-value').text()).toBe(
      JSON.stringify({ a: 'top a' })
    );
    expect(wrapper.find('.form-touched').text()).toBe(JSON.stringify({}));
    expect(wrapper.find('.value').text()).toBe('top a');
    expect(wrapper.find('.touched').text()).toBe('true');
    expect(wrapper.find('.error').text()).toBe('error');
    expect(wrapper.find('.active').text()).toBe('false');
    expect(wrapper.find('.editable').text()).toBe('false');
    expect(wrapper.find('.visible').text()).toBe('false');
  });

  it('should set field value', async () => {
    const Field = createField({
      template: `
        <div :data-key="name">
          <span class="value">{{ value }}</span>
          <button
           class="change"
           @click="() => setValue('next')"
          >
            click
          </button>
        </div>
      `,
    });

    const wrapper = mount({
      components: {
        Form,
        Field,
      },
      template: `
        <Form :initial-state="{
          values: { a: 'init a', b: 'init b' },
        }">
          <template #default="{ form }">
            <span class="form-value">{{ JSON.stringify(form.values.value) }}</span>
            <Field name="a" />
            <Field name="c.d" />
          </template>
        </Form>
      `,
    });

    expect(wrapper.find('.form-value').text()).toBe(
      JSON.stringify({
        a: 'init a',
        b: 'init b',
      })
    );
    expect(wrapper.find('[data-key="a"] .value').text()).toBe('init a');

    wrapper.find('[data-key="a"] .change').trigger('click');

    await wrapper.vm.$nextTick();
    expect(wrapper.find('.form-value').text()).toBe(
      JSON.stringify({
        a: 'next',
        b: 'init b',
      })
    );
    expect(wrapper.find('[data-key="a"] .value').text()).toBe('next');

    wrapper.find('[data-key="c.d"] .change').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.form-value').text()).toBe(
      JSON.stringify({
        a: 'next',
        b: 'init b',
        c: {
          d: 'next',
        },
      })
    );
    expect(wrapper.find('[data-key="c.d"] .value').text()).toBe('next');
  });

  it('should delete all related state after unmount', () => {});
});
