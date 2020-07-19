import Vue from 'vue';
import {
  ref,
  isRef,
  watch,
  inject,
  provide,
  reactive,
  computed,
} from '@vue/composition-api';
import { get, each, last, isEqual, isEmpty, cloneDeep } from 'lodash-es';
import { unref, $set, $delete, isDev } from '../utils';

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
  initialState = {},

  /* eslint-disable no-unused-vars */
  onReset = async (values, helpers) => {},
  // eslint-disable-next-line
  onSubmit = async (values, helpers) => {},
  validate = async (values, helpers) => null,
  /* eslint-enable no-unused-vars */
  validateOnMount = true,
  validateOnBlur = true,
  validateOnChange = true,
} = {}) {
  const initialStateValue = unref(initialState);
  const valuesBag = useStateBag(initialStateValue.values || emptyState());
  const touchedBag = useStateBag(initialStateValue.touched || emptyState());
  const errorsBag = useStateBag(initialStateValue.errors || emptyState());
  const activesBag = useStateBag(initialStateValue.actives || emptyState());
  const editableBag = useStateBag(initialStateValue.editable || emptyState());
  const visibleBag = useStateBag(initialStateValue.visible || emptyState());
  const additionBag = useStateBag(initialStateValue.addition || emptyState());

  // values
  const values = valuesBag.state;
  const getFieldValue = valuesBag.getFieldState;
  const setValues = valuesBag.setState;
  const setBatchValues = valuesBag.setBatchState;
  const setFieldValue = valuesBag.setFieldState;
  const deleteFieldValue = valuesBag.deleteFieldState;

  // touched
  const touched = touchedBag.state;
  const getFieldTouched = touchedBag.getFieldState;
  const setTouched = touchedBag.setState;
  const setBatchTouched = touchedBag.setBatchState;
  const setFieldTouched = touchedBag.setFieldState;
  const deleteFieldTouched = touchedBag.deleteFieldState;

  // errors
  const errors = errorsBag.state;
  const getFieldError = errorsBag.getFieldState;
  const setErrors = errorsBag.setState;
  const setBatchErrors = errorsBag.setBatchState;
  const setFieldError = errorsBag.setFieldState;
  const deleteFieldError = errorsBag.deleteFieldState;

  // actives
  const actives = activesBag.state;
  const getFieldActive = activesBag.getFieldState;
  const setActives = activesBag.setState;
  const setBatchActives = activesBag.setBatchState;

  // 未激活的时候字段值设为默认
  const setFieldActive = (
    fieldPath,
    active,
    shouldRestore = true,
    defaultValue
  ) => {
    activesBag.setFieldState(fieldPath, active);
    if (!active && shouldRestore) {
      setFieldValue(fieldPath, defaultValue);
    }
  };
  const deleteFieldActive = activesBag.deleteFieldState;

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

  // addition
  const addition = additionBag.state;
  const getFieldAddition = additionBag.getFieldState;
  const setAddition = additionBag.setState;
  const setBatchAddition = additionBag.setBatchState;
  const setFieldAddition = additionBag.setFieldState;
  const deleteFieldAddition = additionBag.deleteFieldState;

  const fields = ref({});

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
    const curValues = cloneDeep(valuesBag.getState());
    each(fields.value, (field, fieldPath) => {
      if (field.active.value !== false) {
        return;
      }

      // 先把字段的值删除了
      $delete(curValues, fieldPath);

      // 路径中包含数组，数组中所有状态都是 `inactive` 则删除空的元素
      // delete fieldPath `a.b[0].foo`
      //    { a: { b: [{ foo: true }] } }
      // => { a: { b: [{}] } }
      if (!isDeepPath(fieldPath)) {
        return;
      }

      // ['a', 'b[0]', 'foo'] => ['a', 'b[0]']
      const paths = fieldPath.split('.');
      paths.pop();

      // key: 'b', index: '0'
      const { key, index } = matchArrayKeyIndex(paths);
      if (key === undefined) {
        return;
      }

      // ['a', 'b[0]'] => ['a', 'b']
      paths[paths.length - 1] = key;

      // [{}]
      const array = get(curValues, paths);
      if (isEmpty(array[index])) {
        array.splice(index, 1);
      }
    });

    return curValues;
  });

  // 注册字段
  const registerField = (fieldPath, field) => {
    Vue.set(fields.value, fieldPath, field);
  };

  // 注销字段
  const unregisterField = (fieldPath) => {
    const field = fields.value[fieldPath];
    if (!field) {
      return;
    }
    Vue.delete(fields.value, fieldPath);
  };

  // 获取字段
  const getField = (fieldPath) => fields.value[fieldPath];

  // 重置表单状态
  const reinitialize = (nextState = {}) => {
    nextState.values && valuesBag.setInitialState(nextState.values);
    valuesBag.state.value = valuesBag.getClonedInitialState();

    nextState.touched && touchedBag.setInitialState(nextState.touched);
    touchedBag.state.value = touchedBag.getClonedInitialState();

    nextState.errors && errorsBag.setInitialState(nextState.errors);
    errorsBag.state.value = errorsBag.getClonedInitialState();

    nextState.actives && activesBag.setInitialState(nextState.actives);
    activesBag.state.value = activesBag.getClonedInitialState();

    nextState.editable && editableBag.setInitialState(nextState.editable);
    editableBag.state.value = editableBag.getClonedInitialState();

    nextState.visible && visibleBag.setInitialState(nextState.visible);
    visibleBag.state.value = visibleBag.getClonedInitialState();
  };

  const execValidate = async (values, form) => {
    validating.value = true;
    try {
      const errors = await validate(values, form);

      setErrors(errors || {});

      const isValid = isEmpty(errors);
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
  const execSubmit = async (values, form) => {
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
  const execReset = (values, form) => {
    const nextState = onReset(values, form);
    reinitialize(nextState);
  };
  const handleReset = () => execReset(valuesBag.getState(), form);

  if (isRef(initialState)) {
    watch(initialState, (nextState) => {
      reinitialize(nextState);
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

    errors,
    getFieldError,
    setErrors,
    setBatchErrors,
    setFieldError,
    deleteFieldError,

    actives,
    getFieldActive,
    setActives,
    setBatchActives,
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

    // addition
    addition,
    setAddition,
    setBatchAddition,
    getFieldAddition,
    setFieldAddition,
    deleteFieldAddition,

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

export const FORM_CONTEXT = Symbol('FORM_CONTEXT');

export const useFormInject = () => {
  const form = inject(FORM_CONTEXT);
  if (!form) {
    throw new Error(
      '`useFormInject` should be used within `useForm` component'
    );
  }
  return form;
};

export const useFormProvide = (form) => {
  provide(FORM_CONTEXT, form);
};

// eslint-disable-next-line func-style
function useStateBag(rawInitialState) {
  let initialState = cloneDeep(rawInitialState);

  const getInitialState = () => initialState;
  const getClonedInitialState = () => cloneDeep(initialState);
  const setInitialState = (nextInitialState) => {
    initialState = nextInitialState;
  };

  const state = ref(getClonedInitialState());
  const getState = () => state.value;
  const setState = (nextState) => {
    state.value = nextState;
  };
  const setBatchState = (nextState) => {
    Object.assign(state.value, nextState);
  };
  const setFieldState = (fieldPath, nextState) => {
    $set(state.value, fieldPath, nextState);
  };
  const deleteFieldState = (fieldPath) => {
    $delete(state.value, fieldPath);
  };

  const getFieldState = (fieldPath) => get(state.value, fieldPath);

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

// eslint-disable-next-line func-style
function isDeepPath(paths) {
  return paths.split('.').length > 1;
}

// eslint-disable-next-line func-style
function matchArrayKeyIndex(paths) {
  // b[0]
  const maybeArrayPath = last(paths);

  // 'b[0]' => ['b', '0']
  const matched = maybeArrayPath.match(/(.+)\[(.+)]/);
  return matched ? { key: matched[1], index: matched[2] } : {};
}
