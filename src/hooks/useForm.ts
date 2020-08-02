import Vue from 'vue';
import {
  ref,
  isRef,
  watch,
  unref,
  inject,
  provide,
  reactive,
  computed,
  InjectionKey,
} from '@vue/composition-api';
import { get, each, isEqual, isEmpty, cloneDeep } from 'lodash-es';
import { $set, $delete, cloneNestedObject, isDev } from '../utils';

export type FieldPath = string | string[];

export interface FormState {
  values: Record<string, any>;
  error: Record<string, any>;
  touched: Record<string, any>;
  active: Record<string, any>;
  editable: Record<string, any>;
  visible: Record<string, any>;
}

export interface UseFormParams {
  initialState?: FormState;
  onReset?: (
    values: Record<string, any>,
    form: ReturnType<typeof useForm>
  ) => void;
  onSubmit?: (
    values: Record<string, any>,
    form: ReturnType<typeof useForm>
  ) => Promise<any>;
  validate?: (
    values: Record<string, any>,
    form: ReturnType<typeof useForm>
  ) => Promise<Record<string, string> | null>;
  validateOnMount?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export type UseForm = {
  [key: string]: any;
};
// export interface UseForm {
//   dirty: boolean;
//   submitting: boolean;
//   validating: boolean;
//   activeValues: Record<string, any>;
//
//   values: Record<string, any>;
//   getFieldValue;
//   setValues;
//   setBatchValues;
//   setFieldValue;
//   deleteFieldValue;
//
//   touched: Record<string, any>;
//   getFieldTouched;
//   setTouched;
//   setBatchTouched;
//   setFieldTouched;
//   deleteFieldTouched;
//
//   error: Record<string, any>;
//   getFieldError;
//   setError;
//   setBatchError;
//   setFieldError;
//   deleteFieldError;
//
//   active: Record<string, any>;
//   getFieldActive;
//   setActive;
//   setBatchActive;
//   setFieldActive;
//   deleteFieldActive;
//
//   editable: Record<string, any>;
//   getFieldEditable;
//   setEditable;
//   setBatchEditable;
//   setFieldEditable;
//   deleteFieldEditable;
//
//   visible: Record<string, any>;
//   getFieldVisible;
//   setVisible;
//   setBatchVisible;
//   setFieldVisible;
//   deleteFieldVisible;
//
//   reinitialize;
//
//   fields;
//   getField;
//   registerField;
//   unregisterField;
//
//   execReset;
//   execValidate;
//   execSubmit;
//
//   handleValidate;
//   handleReset;
//   handleSubmit;
//
//   // 一些配置
//   validateOnMount: boolean;
//   validateOnBlur: boolean;
//   validateOnChange: boolean;
// }

const emptyState = () => ({});

/**
 * useForm
 *
 * @param {Object} initialState 表单状态
 * @param onReset
 * @param onSubmit
 * @param validate
 * @param validateOnMount
 * @param validateOnBlur
 * @param validateOnChange
 * @returns {Object}
 */
export default function useForm({
  initialState = {
    values: {},
    error: {},
    touched: {},
    active: {},
    editable: {},
    visible: {},
  },

  /* eslint-disable no-unused-vars */
  onReset = async (values, helpers) => {},
  // eslint-disable-next-line
  onSubmit = async (values, helpers) => {},
  validate = async (values, helpers) => null,
  /* eslint-enable no-unused-vars */
  validateOnMount = true,
  validateOnBlur = true,
  validateOnChange = true,
}: UseFormParams = {}): UseForm {
  const initialStateValue = unref(initialState);
  const valuesBag = useStateBag(initialStateValue.values || emptyState());
  const touchedBag = useStateBag(initialStateValue.touched || emptyState());
  const errorBag = useStateBag(initialStateValue.error || emptyState());
  const activeBag = useStateBag(initialStateValue.active || emptyState());
  const editableBag = useStateBag(initialStateValue.editable || emptyState());
  const visibleBag = useStateBag(initialStateValue.visible || emptyState());

  // values
  const values = valuesBag.state;
  const getFieldValue = valuesBag.getFieldState;
  const setValues = valuesBag.setState;
  const setBatchValues = valuesBag.setBatchState;
  const setFieldValue = (fieldPath: FieldPath, value: any) => {
    valuesBag.setFieldState(fieldPath, value);
    touchedBag.setFieldState(fieldPath, true);
  };
  const deleteFieldValue = valuesBag.deleteFieldState;

  // touched
  const touched = touchedBag.state;
  const getFieldTouched = touchedBag.getFieldState;
  const setTouched = touchedBag.setState;
  const setBatchTouched = touchedBag.setBatchState;
  const setFieldTouched = touchedBag.setFieldState;
  const deleteFieldTouched = touchedBag.deleteFieldState;

  // error
  const error = errorBag.state;
  const getFieldError = errorBag.getFieldState;
  const setError = errorBag.setState;
  const setBatchError = errorBag.setBatchState;
  const setFieldError = errorBag.setFieldState;
  const deleteFieldError = errorBag.deleteFieldState;

  // active
  const active = activeBag.state;
  const getFieldActive = activeBag.getFieldState;
  const setActive = activeBag.setState;
  const setBatchActive = activeBag.setBatchState;

  // 未激活的时候字段值设为默认
  const setFieldActive = (
    fieldPath: FieldPath,
    active: boolean,
    shouldRestore: boolean = true,
    defaultValue: any
  ) => {
    activeBag.setFieldState(fieldPath, active);
    if (!active && shouldRestore) {
      setFieldValue(fieldPath, defaultValue);
    }
  };
  const deleteFieldActive = activeBag.deleteFieldState;

  // editable
  const editable = editableBag.state;
  const getFieldEditable = editableBag.getFieldState;
  const setEditable = editableBag.setState;
  const setBatchEditable = editableBag.setBatchState;
  const setFieldEditable = editableBag.setFieldState;
  const deleteFieldEditable = editableBag.deleteFieldState;

  // visible
  const visible = visibleBag.state;
  const getFieldVisible = visibleBag.getFieldState;
  const setVisible = visibleBag.setState;
  const setBatchVisible = visibleBag.setBatchState;
  const setFieldVisible = visibleBag.setFieldState;
  const deleteFieldVisible = visibleBag.deleteFieldState;

  const fields = ref<{ [key: string]: any }>({});

  const submitting = ref(false);
  const validating = ref(false);

  // 表单的值是否修改过
  const dirty = computed(() => {
    const initialState = valuesBag.getInitialState();
    const currentState = valuesBag.getState();

    if (isDev) {
      console.log(
        'compare initialState and currentState:',
        initialState,
        currentState
      );
    }

    return !isEqual(initialState, currentState);
  });

  // 所有 `active` 的表单值
  const activeValues = computed(() => {
    const curValues = valuesBag.getState();
    return cloneNestedObject(curValues, (path) => getFieldActive(path));
  });

  // 注册字段
  const registerField = (fieldPath: string, field: any) => {
    Vue.set(fields.value, fieldPath, field);
  };

  // 注销字段
  const unregisterField = (fieldPath: string) => {
    const field = fields.value[fieldPath];
    if (!field) {
      return;
    }
    Vue.delete(fields.value, fieldPath);
  };

  // 获取字段
  const getField = (fieldPath: string) => fields.value[fieldPath];

  // 重置表单状态
  const reinitialize = (
    nextState: UseFormParams['initialState'] = {
      values: {},
      error: {},
      touched: {},
      active: {},
      editable: {},
      visible: {},
    }
  ) => {
    nextState.values && valuesBag.setInitialState(nextState.values);
    valuesBag.state.value = valuesBag.getClonedInitialState();

    nextState.touched && touchedBag.setInitialState(nextState.touched);
    touchedBag.state.value = touchedBag.getClonedInitialState();

    nextState.error && errorBag.setInitialState(nextState.error);
    errorBag.state.value = errorBag.getClonedInitialState();

    nextState.active && activeBag.setInitialState(nextState.active);
    activeBag.state.value = activeBag.getClonedInitialState();

    nextState.editable && editableBag.setInitialState(nextState.editable);
    editableBag.state.value = editableBag.getClonedInitialState();

    nextState.visible && visibleBag.setInitialState(nextState.visible);
    visibleBag.state.value = visibleBag.getClonedInitialState();

    each(fields.value, (field) => {
      field.reinitialize();
    });
  };

  const execValidate = async (values: FormState['values'], form: UseForm) => {
    validating.value = true;
    try {
      const error = await validate(values, form);

      setError(error || {});

      const isValid = isEmpty(error);
      return isValid;
    } catch (error) {
      isDev && console.error('`useForm.execValidate` error', error);
      throw error;
    } finally {
      validating.value = false;
    }
  };
  const handleValidate = () =>
    execValidate(cloneDeep(activeValues.value), form);

  // 提交表单数据
  const execSubmit = async (values: FormState['values'], form: UseForm) => {
    submitting.value = true;

    // TODO: set all campaignFormFields touched

    const isValid = await execValidate(values, form);
    if (!isValid) {
      return;
    }

    let submitResult;
    try {
      submitResult = await onSubmit(values, form);
    } catch (error) {
      isDev && console.error('`useForm.execSubmit` error', error);
      throw error;
    } finally {
      submitting.value = false;
    }

    return submitResult;
  };
  const handleSubmit = () => execSubmit(cloneDeep(activeValues.value), form);

  // 重置表单状态
  const execReset = (
    values: FormState['values'],
    form: ReturnType<typeof useForm>
  ) => {
    const nextState = onReset(values, form);
    reinitialize(nextState as any);
  };
  const handleReset = () => execReset(valuesBag.getState(), form);

  if (isRef(initialState)) {
    watch(initialState, (nextState) => {
      reinitialize(nextState as any);
    });
  }

  const form = reactive({
    dirty,
    submitting,
    validating,
    activeValues,

    values,
    getFieldValue,
    setValues,
    setBatchValues,
    setFieldValue,
    deleteFieldValue,

    touched,
    getFieldTouched,
    setTouched,
    setBatchTouched,
    setFieldTouched,
    deleteFieldTouched,

    error,
    getFieldError,
    setError,
    setBatchError,
    setFieldError,
    deleteFieldError,

    active,
    getFieldActive,
    setActive,
    setBatchActive,
    setFieldActive,
    deleteFieldActive,

    editable,
    getFieldEditable,
    setEditable,
    setBatchEditable,
    setFieldEditable,
    deleteFieldEditable,

    visible,
    getFieldVisible,
    setVisible,
    setBatchVisible,
    setFieldVisible,
    deleteFieldVisible,

    reinitialize,

    fields,
    getField,
    registerField,
    unregisterField,

    execReset,
    execValidate,
    execSubmit,

    handleValidate,
    handleReset,
    handleSubmit,

    // 一些配置
    validateOnMount,
    validateOnBlur,
    validateOnChange,
  });

  return form;
}

export const FORM_CONTEXT: InjectionKey<UseForm> = Symbol('FORM_CONTEXT');

export const useFormInject = () => {
  const form = inject(FORM_CONTEXT);
  if (!form) {
    throw new Error(
      '`useFormInject` should be used within `useForm` component'
    );
  }
  return form;
};

export const useFormProvide = (form: UseForm) => {
  provide(FORM_CONTEXT, form);
};

function useStateBag<T extends object>(rawInitialState: T) {
  let initialState = cloneDeep(rawInitialState);

  const getInitialState = () => initialState;
  const getClonedInitialState = () => cloneDeep(initialState);
  const setInitialState = (nextInitialState: T) => {
    initialState = nextInitialState;
  };

  const state = ref(getClonedInitialState());
  const getState = () => state.value as T;
  const setState = (nextState: T) => {
    state.value = nextState;
  };
  const setBatchState = (nextState: T) => {
    Object.assign(state.value, nextState);
  };
  const setFieldState = (fieldPath: FieldPath, nextState: any) => {
    $set(state.value, fieldPath, nextState);
  };
  const deleteFieldState = (fieldPath: FieldPath) => {
    $delete(state.value, fieldPath);
  };

  const getFieldState = (fieldPath: FieldPath) => get(state.value, fieldPath);

  return {
    state,
    getState,
    getFieldState,
    getInitialState,
    getClonedInitialState,

    setInitialState,
    setState,
    setBatchState,
    setFieldState,

    deleteFieldState,
  };
}
