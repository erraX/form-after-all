import { get } from 'lodash-es';
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
    initialTouched = false,
    initialError = '',
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
  const value = computed(() => get(form.values, fieldPath));
  const setValue = (nextValue) => {
    form.setFieldValue(fieldPath, nextValue);
  };

  // touched
  const touched = computed(() => get(form.touched, fieldPath));
  const setTouched = (touched) => {
    form.setFieldTouched(fieldPath, touched);
  };
  const deleteTouched = () => {
    form.deleteFieldTouched(fieldPath);
  };
  if (touched.value === undefined) {
    setTouched(initialTouched);
  }

  // error
  const error = computed(() => get(form.error, fieldPath));
  const setError = (error) => {
    form.setFieldError(fieldPath, error);
  };
  const deleteError = () => {
    form.deleteFieldError(fieldPath);
  };
  if (error.value === undefined) {
    setError(initialError);
  }

  // active
  const active = computed(() => get(form.active, fieldPath));
  const setActive = (
    active,
    shouldRestore = restoreWhenBecomeInactive,
    curDefaultValue = defaultValue
  ) => {
    form.setFieldActive(fieldPath, active, shouldRestore, curDefaultValue);
  };
  const deleteActive = () => {
    form.deleteFieldActive(fieldPath);
  };
  if (active.value === undefined) {
    setActive(true);
  }

  // editable
  const editable = computed(() => get(form.editable, fieldPath));
  const setEditable = (editable) => {
    form.setFieldEditable(fieldPath, editable);
  };
  const deleteEditable = () => {
    form.deleteFieldActive(fieldPath);
  };
  if (editable.value === undefined) {
    setEditable(true);
  }

  // visible
  const visible = computed(() => get(form.visible, fieldPath));
  const setVisible = (visible) => {
    form.setFieldVisible(fieldPath, visible);
  };
  const deleteVisible = () => {
    form.deleteFieldVisible(fieldPath);
  };
  if (visible.value === undefined) {
    setVisible(true);
  }

  const destroy = () => {
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
    watchEffect(() => {
      setActive(!!activeWhen(), restoreWhenBecomeInactive, defaultValue);
    });
  }

  if (editableWhen) {
    watchEffect(() => {
      setEditable(!!editableWhen());
    });
  }

  if (visibleWhen) {
    watchEffect(() => {
      setVisible(!!visibleWhen());
    });
  }

  const field = reactive({
    value,
    setValue,

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
