import { get } from 'lodash-es';
import {
  reactive,
  computed,
  onUnmounted,
  watchEffect,
  WatchStopHandle,
} from '@vue/composition-api';
import { useFormInject } from './useForm';

export interface UseFieldOptions {
  initialTouched?: boolean;
  initialError?: string;
  activeWhen?: () => boolean;
  visibleWhen?: () => boolean;
  editableWhen?: () => boolean;
  defaultValue?: () => boolean;
  restoreWhenBecomeInactive?: boolean;
}

export interface UseField {
  value: any;
  setValue: (value: any) => void;

  touched: boolean;
  setTouched: (touched: boolean) => void;

  error: string;
  setError: (error: string) => void;

  active: boolean;
  setActive: (
    active: boolean,
    shouldRestore?: boolean,
    curDefaultValue?: any
  ) => void;

  editable: boolean;
  setEditable: (editable: boolean) => void;

  visible: boolean;
  setVisible: (visible: boolean) => void;

  destroy: () => void;
  reinitialize: () => void;
}

export default function useField(
  fieldPath: string,
  {
    initialTouched = false,
    initialError = '',
    activeWhen,
    visibleWhen,
    editableWhen,
    defaultValue,
    restoreWhenBecomeInactive = true,
  }: UseFieldOptions = {}
): UseField {
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
  const setValue = (nextValue: any) => {
    form.setFieldValue(fieldPath, nextValue as any);
  };

  // touched
  const touched = computed(() => get(form.touched, fieldPath) as boolean);
  const setTouched = (touched: boolean) => {
    form.setFieldTouched(fieldPath, touched);
  };

  // error
  const error = computed(() => get(form.error, fieldPath) as string);
  const setError = (error: string) => {
    form.setFieldError(fieldPath, error);
  };

  // active
  const active = computed(() => get(form.active, fieldPath) as boolean);
  const setActive = (
    active: boolean,
    shouldRestore = restoreWhenBecomeInactive,
    curDefaultValue = defaultValue
  ) => {
    form.setFieldActive(fieldPath, active, shouldRestore, curDefaultValue);
  };

  // editable
  const editable = computed(() => get(form.editable, fieldPath) as boolean);
  const setEditable = (editable: boolean) => {
    form.setFieldEditable(fieldPath, editable);
  };

  // visible
  const visible = computed(() => get(form.visible, fieldPath) as boolean);
  const setVisible = (visible: boolean) => {
    form.setFieldVisible(fieldPath, visible);
  };

  onUnmounted(() => {
    form.unregisterField(fieldPath);
  });

  let stopWatchActive: WatchStopHandle | null = null;
  if (activeWhen) {
    stopWatchActive = watchEffect(() => {
      setActive(!!activeWhen(), restoreWhenBecomeInactive, defaultValue);
    });
  }

  let stopWatchEditable: WatchStopHandle | null = null;
  if (editableWhen) {
    stopWatchEditable = watchEffect(() => {
      setEditable(!!editableWhen());
    });
  }

  let stopWatchVisible: WatchStopHandle | null = null;
  if (visibleWhen) {
    stopWatchVisible = watchEffect(() => {
      setVisible(!!visibleWhen());
    });
  }

  const destroy = () => {
    stopWatchActive && stopWatchActive();
    stopWatchEditable && stopWatchEditable();
    stopWatchVisible && stopWatchVisible();
  };

  const reinitialize = () => {
    if (touched.value === undefined) {
      setTouched(initialTouched);
    }
    if (error.value === undefined) {
      setError(initialError);
    }
    if (active.value === undefined) {
      setActive(true);
    }
    if (active.value === false) {
      setActive(false);
    }

    if (editable.value === undefined) {
      setEditable(true);
    }
    if (visible.value === undefined) {
      setVisible(true);
    }
  };

  reinitialize();

  const field = reactive({
    value,
    setValue,

    touched,
    setTouched,

    error,
    setError,

    active,
    setActive,

    editable,
    setEditable,

    visible,
    setVisible,

    destroy,
    reinitialize,
  });

  form.registerField(fieldPath, field);

  return field;
}
