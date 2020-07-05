import useField from './useField';

/**
 * 封装自增字段
 *
 * @param {string} key
 * @param {Object} configs
 * @returns {Object}
 */
export default function useFieldArray(key, configs) {
  const field = useField(key, configs);

  const arrayHelpers = {
    push(value) {
      const currentValue = field.value.value || [];
      field.setValue([...currentValue, value]);
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
