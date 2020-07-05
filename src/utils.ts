import Vue from 'vue';
import { isRef } from '@vue/composition-api';

// environment is in development or not
export const isDev: boolean = process.env.NODE_ENv === 'development';

// unwrap `Ref` type value
export const unref = (value: any): any => (isRef(value) ? value.value : value);

// array key is marked as `#1#` `#2#` ...
const REG_ARRAY_KEY = /#(.+)#/;

// `b[0]`
const REG_ARRAY_PATH = /(.+)\[(.+)]/;

const matchArrayKey = (key: string): string => {
  const matched = key.match(REG_ARRAY_KEY);
  if (!matched) {
    return '';
  }
  return matched[1];
};

const matchArrayPath = (path: string) => {
  const matched = path.match(REG_ARRAY_PATH);
  if (!matched) {
    return [];
  }
  return [matched[1], matched[2]];
};

// 'a.b.c' => ['a', 'b', 'c']
// 'a.b[0].c' => ['a', '#b#', '0', 'c']
const pathToKeys = (path: string) =>
  path
    .split('.')
    .filter((p) => p !== '')
    .map((p) => {
      const arrayPaths = matchArrayPath(p);
      return !arrayPaths.length ? p : [`#${arrayPaths[0]}#`, arrayPaths[1]];
    })
    .flat();

// eslint-disable-next-line import/prefer-default-export
export const $set = (obj: any, path: string, value: any) => {
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
    } else if (!parent[key]) {
      Vue.set(parent, key, {});
    }

    return parent[key];
  }, obj);

  return obj;
};

export const $delete = (obj: any, path: string) => {
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
