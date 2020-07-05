'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var compositionApi = require('@vue/composition-api');
var lodashEs = require('lodash-es');

// environment is in development or not
const isDev = process.env.NODE_ENv === 'development';
// unwrap `Ref` type value
const unref = (value) => (compositionApi.isRef(value) ? value.value : value);
// array key is marked as `#1#` `#2#` ...
const REG_ARRAY_KEY = /#(.+)#/;
// `b[0]`
const REG_ARRAY_PATH = /(.+)\[(.+)]/;
const matchArrayKey = (key) => {
    const matched = key.match(REG_ARRAY_KEY);
    if (!matched) {
        return '';
    }
    return matched[1];
};
const matchArrayPath = (path) => {
    const matched = path.match(REG_ARRAY_PATH);
    if (!matched) {
        return [];
    }
    return [matched[1], matched[2]];
};
// 'a.b.c' => ['a', 'b', 'c']
// 'a.b[0].c' => ['a', '#b#', '0', 'c']
const pathToKeys = (path) => path
    .split('.')
    .filter((p) => p !== '')
    .map((p) => {
    const arrayPaths = matchArrayPath(p);
    return !arrayPaths.length ? p : [`#${arrayPaths[0]}#`, arrayPaths[1]];
})
    .flat();
// eslint-disable-next-line import/prefer-default-export
const $set = (obj, path, value) => {
    const keys = pathToKeys(path);
    const lastIndex = keys.length - 1;
    keys.reduce((parent, key, index) => {
        const arrayKey = matchArrayKey(key);
        if (arrayKey) {
            if (!parent[arrayKey]) {
                Vue.set(parent, arrayKey, []);
            }
            return parent[arrayKey];
        }
        if (index === lastIndex) {
            // TODO: delete if value is undefined
            Vue.set(parent, key, value);
        }
        else if (!parent[key]) {
            Vue.set(parent, key, {});
        }
        return parent[key];
    }, obj);
    return obj;
};
const $delete = (obj, path) => {
    const keys = pathToKeys(path);
    const lastIndex = keys.length - 1;
    /* eslint array-callback-return: ["error", { allowImplicit: true }]*/
    keys.reduce((parent, key, index) => {
        if (parent === undefined) {
            return undefined;
        }
        const arrayKey = matchArrayKey(key);
        if (arrayKey) {
            return parent[arrayKey];
        }
        if (index === lastIndex) {
            Vue.delete(parent, key);
        }
        return parent[key];
    }, obj);
};

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
function useForm({
  initialState = {},
  mode = 'CREATE',

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
    defaultValue,
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

  const fields = compositionApi.ref({});

  const submitting = compositionApi.ref(false);
  const validating = compositionApi.ref(false);

  // 表单的值是否修改过
  const dirty = compositionApi.computed(() => {
    const initialState = valuesBag.getInitialState();
    const currentState = valuesBag.getState();

    if (isDev) {
      console.log('compare initialState and currentState:', initialState, currentState);
    }

    return !lodashEs.isEqual(
      initialState,
      currentState,
    );
  });

  // 所有 `active` 的表单值
  const activeValues = compositionApi.computed(() => {
    const curValues = lodashEs.cloneDeep(valuesBag.getState());
    lodashEs.each(fields.value, (field, fieldPath) => {
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
      const array = lodashEs.get(curValues, paths);
      if (lodashEs.isEmpty(array[index])) {
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
  const getField = fieldPath => fields.value[fieldPath];

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

      const isValid = lodashEs.isEmpty(errors);
      return isValid;
    } catch (error) {
      isDev && console.error('`useForm.execValidate` error', error);
      throw error;
    } finally {
      validating.value = false;
    }
  };
  const handleValidate = () => execValidate(lodashEs.cloneDeep(activeValues.value), form);

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
  const handleSubmit = () => execSubmit(lodashEs.cloneDeep(activeValues.value), form);

  // 重置表单状态
  const execReset = (values, form) => {
    const nextState = onReset(values, form);
    reinitialize(nextState);
  };
  const handleReset = () => execReset(valuesBag.getState(), form);

  if (compositionApi.isRef(initialState)) {
    compositionApi.watch(initialState, (nextState) => {
      reinitialize(nextState);
    });
  }

  const form = {
    mode,
    isCreateMode: mode === 'CREATE',
    isEditMode: mode === 'EDIT',

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
  };

  useFormProvide(form);

  return form;
}

const FORM_CONTEXT = Symbol('FORM_CONTEXT');

const useFormInject = () => {
  const form = compositionApi.inject(FORM_CONTEXT);
  if (!form) {
    throw new Error('`useFormInject` should be used within `useForm` component');
  }
  return form;
};

const useFormProvide = (form) => {
  compositionApi.provide(FORM_CONTEXT, form);
};

// eslint-disable-next-line func-style
function useStateBag(rawInitialState) {
  let initialState = lodashEs.cloneDeep(rawInitialState);

  const getInitialState = () => initialState;
  const getClonedInitialState = () => lodashEs.cloneDeep(initialState);
  const setInitialState = (nextInitialState) => {
    initialState = nextInitialState;
  };

  const state = compositionApi.ref(getClonedInitialState());
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

  const getFieldState = fieldPath => lodashEs.get(state.value, fieldPath);

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
  const maybeArrayPath = lodashEs.last(paths);

  // 'b[0]' => ['b', '0']
  const matched = maybeArrayPath.match(/(.+)\[(.+)]/);
  return matched
    ? { key: matched[1], index: matched[2] }
    : {};
}

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
function useField(fieldPath, {
  initialState = {},
  activeWhen,
  visibleWhen,
  editableWhen,
  clearWhen,
  defaultValue,
  restoreWhenBecomeInactive = true,
} = {}) {
  if (!fieldPath) {
    throw new Error('`fieldPath` is missing when register a field.');
  }

  // eslint-disable-next-line no-param-reassign
  initialState = lodashEs.defaults(initialState, {
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
    console.warn(`field: "${fieldPath}" using \`activeWhen\` side effect, ` +
      'but `defaultValue` and initial value` is `undefined`. ' +
      'it could cause unexpected form value.' +
      'Please specify `defaultValue` when using `Field`.');
  }

  const form = useFormInject();

  // value
  const value = compositionApi.computed(() => lodashEs.get(form.values.value, fieldPath, initialState.value));
  const setValue = (nextValue) => {
    form.setFieldValue(fieldPath, nextValue);
  };
  const deleteValue = () => {
    form.deleteFieldValue(fieldPath);
  };

  // touched
  const touched = compositionApi.computed(() => lodashEs.get(form.touched.value, fieldPath, initialState.touched));
  const setTouched = (touched) => {
    form.setFieldTouched(fieldPath, touched);
  };
  const deleteTouched = () => {
    form.deleteFieldTouched(fieldPath);
  };

  // error
  const error = compositionApi.computed(() => lodashEs.get(form.errors.value, fieldPath, initialState.error));
  const setError = (error) => {
    form.setFieldError(fieldPath, error);
  };
  const deleteError = () => {
    form.deleteFieldError(fieldPath);
  };

  // active
  const active = compositionApi.computed(() => lodashEs.get(form.actives.value, fieldPath, initialState.active));
  const setActive = (
    active,
    shouldRestore = restoreWhenBecomeInactive,
    curDefaultValue = defaultValue,
  ) => {
    form.setFieldActive(fieldPath, active, shouldRestore, curDefaultValue);
  };
  const deleteActive = () => {
    form.deleteFieldActive(fieldPath);
  };

  // editable
  const editable = compositionApi.computed(() => lodashEs.get(form.editable.value, fieldPath, initialState.editable));
  const setEditable = (editable) => {
    form.setFieldEditable(fieldPath, editable);
  };
  const deleteEditable = () => {
    form.deleteFieldActive(fieldPath);
  };

  // visible
  const visible = compositionApi.computed(() => lodashEs.get(form.visible.value, fieldPath, initialState.visible));
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

  compositionApi.onUnmounted(() => {
    destroy();
    form.unregisterField(fieldPath);
  });

  if (activeWhen) {
    setActive(!!activeWhen(), restoreWhenBecomeInactive, defaultValue);
    compositionApi.watchEffect(() => {
      setActive(!!activeWhen(), restoreWhenBecomeInactive, defaultValue);
    });
  }

  if (editableWhen) {
    setEditable(!!editableWhen());
    compositionApi.watchEffect(() => {
      setEditable(!!editableWhen());
    });
  }

  if (visibleWhen) {
    setVisible(!!visibleWhen());
    compositionApi.watchEffect(() => {
      setVisible(!!visibleWhen());
    });
  }

  const field = {
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
  };

  form.registerField(fieldPath, field);

  return field;
}

/**
 * 封装自增字段
 *
 * @param {string} key
 * @param {Object} configs
 * @returns {Object}
 */
function useFieldArray(key, configs) {
  const field = useField(key, configs);

  const arrayHelpers = {
    push(value) {
      const currentValue = field.value.value || [];
      field.setValue([
        ...currentValue,
        value,
      ]);
    },

    pop() {
      const currentValue = [...field.value.value];
      currentValue.pop();
      field.setValue(currentValue);
    },

    replaceValue(index, value) {
      const currentValue = [...field.value.value];
      currentValue[index] = value;
      field.setValue(currentValue);
    },

    // TODO:
    // shift() {},
    // unshift() {},
    // swap() {},
    // insert(index) {},
    // remove(index) {},
    // move(fromIndex, toIndex) {},
  };

  return {
    field,
    arrayHelpers,
  };
}

exports.useField = useField;
exports.useFieldArray = useFieldArray;
exports.useForm = useForm;
exports.useFormInject = useFormInject;
exports.useFormProvide = useFormProvide;
