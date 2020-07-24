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

  initialState = defaults(initialState, {
    value: null,
    touched: false,
    error: '',
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
  const setValue = (nextValue) => {
    form.setFieldValue(fieldPath, nextValue);
  };
  const value = computed(() => get(form.values, fieldPath));
  if (value.value === undefined) {
    setValue(initialState.value);
  }

  // touched
  const setTouched = (touched) => {
    form.setFieldTouched(fieldPath, touched);
  };
  const deleteTouched = () => {
    form.deleteFieldTouched(fieldPath);
  };
  const touched = computed(() => get(form.touched, fieldPath));
  if (touched.value === undefined) {
    setTouched(initialState.touched);
  }

  // error
  const setError = (error) => {
    form.setFieldError(fieldPath, error);
  };
  const deleteError = () => {
    form.deleteFieldError(fieldPath);
  };
  const error = computed(() => get(form.errors, fieldPath));
  if (error.value === undefined) {
    setError(initialState.error);
  }

  // active
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
  const active = computed(() =>
    get(form.actives, fieldPath, initialState.active)
  );
  if (active.value === undefined) {
    setActive(initialState.active);
  }

  // editable
  const setEditable = (editable) => {
    form.setFieldEditable(fieldPath, editable);
  };
  const deleteEditable = () => {
    form.deleteFieldActive(fieldPath);
  };
  const editable = computed(() =>
    get(form.editable, fieldPath, initialState.editable)
  );
  if (editable.value === undefined) {
    setEditable(initialState.editable);
  }

  // visible
  const setVisible = (visible) => {
    form.setFieldVisible(fieldPath, visible);
  };
  const deleteVisible = () => {
    form.deleteFieldVisible(fieldPath);
  };
  const visible = computed(() =>
    get(form.visible, fieldPath, initialState.visible)
  );
  if (visible.value === undefined) {
    setVisible(initialState.visible);
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
    let isCollectDeps = true;
    watchEffect(() => {
      // should exec side effects on first time
      const nextActive = !!activeWhen();

      // but should not set value
      if (isCollectDeps) {
        isCollectDeps = false;
        return;
      }

      setActive(nextActive, restoreWhenBecomeInactive, defaultValue);
    });
  }

  if (editableWhen) {
    let isCollectDeps = true;
    watchEffect(() => {
      // should exec side effects on first time
      const nextEditable = !!editableWhen();

      // but should not set value
      if (isCollectDeps) {
        isCollectDeps = false;
        return;
      }

      setEditable(nextEditable);
    });
  }

  if (visibleWhen) {
    let isCollectDeps = true;
    watchEffect(() => {
      // should exec side effects on first time
      const nextVisible = !!visibleWhen();

      // but should not set value
      if (isCollectDeps) {
        isCollectDeps = false;
        return;
      }

      setVisible(nextVisible);
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
