import { get, defaults } from 'lodash-es';
import {
  reactive,
  computed,
  onUnmounted,
  watchEffect,
} from '@vue/composition-api';
import { useFormInject } from './useForm';

/**
 * `useField` 用到的配置选项，用于给 `Field` 过滤 `props`
 *
 * @type {string[]}
 */
export const useFieldProps = [
  'initialState',
  'activeWhen',
  'visibleWhen',
  'editableWhen',
  'clearWhen',
  'defaultValue',
  'restoreWhenBecomeInactive',
];

/**
 * 创建一个字段
 *
 * @param {string} fieldPath 字段key
 * @param initialState
 * @param restoreWhenBecomeInactive
 * @param defaultValue
 * @param activeWhen
 * @param editableWhen
 * @param visibleWhen
 */
export default function useField(
  fieldPath,
  {
    initialState = {},
    activeWhen,
    visibleWhen,
    editableWhen,
    defaultValue,
    restoreWhenBecomeInactive = true,
  } = {}
) {
  if (!fieldPath) {
    throw new Error('`fieldPath` is missing when register a field.');
  }

  // eslint-disable-next-line no-param-reassign
  initialState = defaults(initialState, {
    value: '',
    touched: false,
    error: undefined,
    active: true,
    editable: true,
    visible: true,
  });

  if (
    activeWhen &&
    defaultValue === undefined &&
    process.env.NODE_ENV === 'development'
  ) {
    console.warn(
      `field: "${fieldPath}" using \`activeWhen\` side effect, ` +
        'but `defaultValue` and initial value` is `undefined`. ' +
        'it could cause unexpected form value.' +
        'Please specify `defaultValue` when using `Field`.'
    );
  }

  const form = useFormInject();

  // value
  const value = computed(() => get(form.values, fieldPath, initialState.value));
  const setValue = (nextValue) => {
    form.setFieldValue(fieldPath, nextValue);
  };
  const deleteValue = () => {
    form.deleteFieldValue(fieldPath);
  };

  // touched
  const touched = computed(() =>
    get(form.touched, fieldPath, initialState.touched)
  );
  const setTouched = (touched) => {
    form.setFieldTouched(fieldPath, touched);
  };
  const deleteTouched = () => {
    form.deleteFieldTouched(fieldPath);
  };

  // error
  const error = computed(() => get(form.errors, fieldPath, initialState.error));
  const setError = (error) => {
    form.setFieldError(fieldPath, error);
  };
  const deleteError = () => {
    form.deleteFieldError(fieldPath);
  };

  // active
  const active = computed(() =>
    get(form.actives, fieldPath, initialState.active)
  );
  const setActive = (
    active,
    shouldRestore = restoreWhenBecomeInactive,
    curDefaultValue = defaultValue
  ) => {
    console.log('setActive', active);
    form.setFieldActive(fieldPath, active, shouldRestore, curDefaultValue);
  };
  const deleteActive = () => {
    form.deleteFieldActive(fieldPath);
  };

  // editable
  const editable = computed(() =>
    get(form.editable, fieldPath, initialState.editable)
  );
  const setEditable = (editable) => {
    form.setFieldEditable(fieldPath, editable);
  };
  const deleteEditable = () => {
    form.deleteFieldActive(fieldPath);
  };

  // visible
  const visible = computed(() =>
    get(form.visible, fieldPath, initialState.visible)
  );
  const setVisible = (visible) => {
    form.setFieldVisible(fieldPath, visible);
  };
  const deleteVisible = () => {
    form.deleteFieldVisible(fieldPath);
  };

  const destroy = () => {
    deleteValue();
    deleteTouched();
    deleteError();
    deleteActive();
    deleteEditable();
    deleteVisible();
  };

  const handleInput = (value) => {
    setValue(value);
  };

  const handleChange = (value) => {
    setValue(value);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  onUnmounted(() => {
    destroy();
    form.unregisterField(fieldPath);
  });

  if (activeWhen) {
    setActive(!!activeWhen(), restoreWhenBecomeInactive, defaultValue);
    watchEffect(() => {
      setActive(!!activeWhen(), restoreWhenBecomeInactive, defaultValue);
    });
  }

  if (editableWhen) {
    setEditable(!!editableWhen());
    watchEffect(() => {
      setEditable(!!editableWhen());
    });
  }

  if (visibleWhen) {
    setVisible(!!visibleWhen());
    watchEffect(() => {
      setVisible(!!visibleWhen());
    });
  }

  const field = reactive({
    value,
    setValue,
    deleteValue,

    touched,
    setTouched,
    deleteTouched,

    error,
    setError,
    deleteError,

    active,
    setActive,
    deleteActive,

    editable,
    setEditable,
    deleteEditable,

    visible,
    setVisible,
    deleteVisible,

    handleInput,
    handleChange,
    handleInputChange,
    handleBlur,

    destroy,
  });

  form.registerField(fieldPath, field);

  return field;
}
