import Vue from 'vue';
// import { isEmpty, get, toPath } from 'lodash-es';
import { toPath } from 'lodash-es';
import { isRef } from '@vue/composition-api';

// environment is development or not
export const isDev: boolean = process.env.NODE_ENV === 'development';

/**
 * unwrap `Ref` type value
 */
export const unref = (value: any): any => (isRef(value) ? value.value : value);

export const isInteger = (obj: any): boolean =>
  String(Math.floor(Number(obj))) === obj;

export const $delete = (obj: any, path: string | string[]) => {
  const pathArray = toPath(path);

  let result = obj;
  let i = 0;
  let currentPath: string;
  for (; i < pathArray.length - 1; i++) {
    currentPath = pathArray[i];
    if (result[currentPath] === undefined) {
      return;
    }
    result = result[currentPath];
  }

  currentPath = pathArray[i];
  Vue.delete(result, currentPath);
};

export const $set = (obj: any, path: string | string[], value?: any) => {
  const pathArray = toPath(path);

  let result = obj;
  let i = 0;
  let currentPath: string;
  for (; i < pathArray.length - 1; i++) {
    currentPath = pathArray[i];
    if (result[currentPath] === undefined) {
      // next key is `0`, `1`, ...
      // means `result[currentPath]` is `Array`
      const nextPath = pathArray[i + 1];
      const isValueArray = isInteger(nextPath) && Number(nextPath) >= 0;
      Vue.set(result, currentPath, isValueArray ? [] : {});
    }
    result = result[currentPath];
  }

  currentPath = pathArray[i];
  if (value === undefined) {
    $delete(result, currentPath);

    // should remove empty parent value ?

    // const prevPath = pathArray.slice(0, i);
    // const prevValue = get(obj, prevPath);
    // if (isEmpty(prevValue)) {
    //   $delete(obj, prevPath);
    // }
  } else {
    if (result[currentPath] !== value) {
      Vue.set(result, currentPath, value);
    }
  }
};
