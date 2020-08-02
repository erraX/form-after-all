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
import { UseField } from './useField';

export interface NestedObjectType<T> {
  [key: string]:
    | T
    | NestedObjectType<T>
    | Array<T | NestedObjectType<T> | NestedObjectType<T>[]>;
}

export type ValuesState = NestedObjectType<any>;
export type ErrorState = NestedObjectType<string>;
export type TouchedState = NestedObjectType<boolean>;
export type ActiveState = NestedObjectType<boolean>;
export type EditableState = NestedObjectType<boolean>;
export type VisibleState = NestedObjectType<boolean>;

export interface FormState {
  values: ValuesState;
  error: ErrorState;
  touched: TouchedState;
  active: ActiveState;
  editable: EditableState;
  visible: VisibleState;
}

export interface UseFormOptions {
  initialState?: FormState;
  onReset?: (values: ValuesState, form: UseForm) => void;
  onSubmit?: (values: ValuesState, form: UseForm) => Promise<any>;
  validate?: (values: ValuesState, form: UseForm) => Promise<ErrorState | null>;
  validateOnMount?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export interface UseForm {
  dirty: boolean;
  submitting: boolean;
  validating: boolean;

  activeValues: ValuesState;

  values: ValuesState;
  getFieldValue: (fieldPath: string) => any;
  setValues: (values: ValuesState) => void;
  setBatchValues: (values: ValuesState) => void;
  setFieldValue: (fieldPath: string, value: any) => void;
  deleteFieldValue: (fieldPath: string) => void;

  touched: TouchedState;
  getFieldTouched: (fieldPath: string) => boolean;
  setTouched: (touched: TouchedState) => void;
  setBatchTouched: (touched: TouchedState) => void;
  setFieldTouched: (fieldPath: string, touched: boolean) => void;
  deleteFieldTouched: (fieldPath: string) => void;

  error: ErrorState;
  getFieldError: (fieldPath: string) => string;
  setError: (error: ErrorState) => void;
  setBatchError: (error: ErrorState) => void;
  setFieldError: (fieldPath: string, error: string) => void;
  deleteFieldError: (fieldPath: string) => void;

  active: ActiveState;
  getFieldActive: (fieldPath: string) => boolean;
  setActive: (active: ActiveState) => void;
  setBatchActive: (active: ActiveState) => void;
  setFieldActive: (
    fieldPath: string,
    active: boolean,
    shouldRestore: boolean,
    defaultValue: any
  ) => void;
  deleteFieldActive: (fieldPath: string) => void;

  editable: EditableState;
  getFieldEditable: (fieldPath: string) => boolean;
  setEditable: (editable: EditableState) => void;
  setBatchEditable: (editable: EditableState) => void;
  setFieldEditable: (fieldPath: string, editable: boolean) => void;
  deleteFieldEditable: (fieldPath: string) => void;

  visible: VisibleState;
  getFieldVisible: (fieldPath: string) => boolean;
  setVisible: (visible: VisibleState) => void;
  setBatchVisible: (visible: VisibleState) => void;
  setFieldVisible: (fieldPath: string, visible: boolean) => void;
  deleteFieldVisible: (fieldPath: string) => void;

  reinitialize: (nextState: UseFormOptions['initialState']) => void;

  fields: { [key: string]: UseField };
  getField: (fieldPath: string) => UseField;
  registerField: (fieldPath: string, field: UseField) => void;
  unregisterField: (fieldPath: string) => void;

  execReset: (values: FormState['values'], form: UseForm) => void;
  execValidate: (values: FormState['values'], form: UseForm) => void;
  execSubmit: (values: FormState['values'], form: UseForm) => Promise<any>;

  handleValidate: () => ReturnType<UseForm['execValidate']>;
  handleReset: () => ReturnType<UseForm['execReset']>;
  handleSubmit: () => ReturnType<UseForm['execSubmit']>;

  validateOnMount: boolean;
  validateOnBlur: boolean;
  validateOnChange: boolean;
}

const emptyState = () => ({});

export default function useForm({
  initialState = {
    values: {},
    error: {},
    touched: {},
    active: {},
    editable: {},
    visible: {},
  },

  onReset = async (values, form) => {},
  onSubmit = async (values, form) => {},
  validate = async (values, form) => null,

  validateOnMount = true,
  validateOnBlur = true,
  validateOnChange = true,
}: UseFormOptions = {}): UseForm {
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
  const setFieldValue = (fieldPath: string, value: any) => {
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
    fieldPath: string,
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

  const fields = ref<{ [key: string]: UseField }>({});

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
    return cloneNestedObject(curValues, (path) =>
      getFieldActive(path.join('.'))
    );
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
    nextState: UseFormOptions['initialState'] = {
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

function useStateBag<T extends NestedObjectType<any>>(rawInitialState: T) {
  let initialState = cloneDeep(rawInitialState);
  const getInitialState = () => initialState;
  const getClonedInitialState = () => cloneDeep(initialState);
  const setInitialState = (nextInitialState: T) => {
    initialState = nextInitialState;
  };

  const state = ref(getClonedInitialState());
  const getState = () => state.value;
  const setState = (nextState: T) => {
    state.value = nextState;
  };

  const setBatchState = (nextState: T) => Object.assign(state.value, nextState);
  const setFieldState = (fieldPath: string, nextState: any) => {
    $set(state.value, fieldPath, nextState);
  };
  const deleteFieldState = (fieldPath: string) => {
    $delete(state.value, fieldPath);
  };

  const getFieldState = (fieldPath: string) => get(state.value, fieldPath);

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
