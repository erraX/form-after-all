import Vue from 'vue';
import { set, get, toPath, isObject } from 'lodash-es';

// environment is development or not
export const isDev: boolean = process.env.NODE_ENV === 'development';

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
  if (Array.isArray(result)) {
    result.splice(currentPath as any, 1);
  } else {
    Vue.delete(result, currentPath);
  }
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

export function setNestedObjectValues<T>(
  object: any,
  value: any,
  visited: any = new WeakMap(),
  response: any = {}
): T {
  for (let k of Object.keys(object)) {
    const val = object[k];
    if (isObject(val)) {
      if (!visited.get(val)) {
        visited.set(val, true);
        response[k] = Array.isArray(val) ? [] : {};
        setNestedObjectValues(val, value, visited, response[k]);
      }
    } else {
      response[k] = value;
    }
  }

  return response;
}

export function getNestedKeys(
  object: any,
  visited: any = new WeakMap(),
  next: any = {},
  paths: any[] = [],
  result: any[] = []
): any {
  for (let k of Object.keys(object)) {
    const val = object[k];
    const currentPaths = [].concat(paths as any, k as any);
    if (isObject(val)) {
      if (!visited.get(val)) {
        visited.set(val, true);
        next[k] = Array.isArray(val) ? [] : {};
        getNestedKeys(val, visited, next, currentPaths, result);
      }
    } else {
      result.push(currentPaths);
    }
  }

  return result;
}

export function cloneNestedObject(
  object: any,
  cloneIf: (path: string[]) => boolean = () => true
): any {
  const result = {};
  const paths = getNestedKeys(object);

  for (let path of paths) {
    if (cloneIf(path)) {
      set(result, path, get(object, path));
    }
  }

  return result;
}
