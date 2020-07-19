import Vue from 'vue';
import { isRef } from '@vue/composition-api';

// environment is development or not
export const isDev: boolean = process.env.NODE_ENv === 'development';

/**
 * unwrap `Ref` type value
 */
export const unref = (value: any): any => (isRef(value) ? value.value : value);

/**
 * array key is marked as `#1#` `#2#` ...
 * `matchArrayKey` will extract these keys
 * eg. '#0#' => '0'
 */
const REG_ARRAY_KEY = /#(.+)#/;
const matchArrayKey = (key: string): { matched: boolean; result?: string } => {
  const result = key.match(REG_ARRAY_KEY);
  if (!result) {
    return { matched: false };
  }
  return {
    matched: true,
    result: result[1],
  };
};

/**
 * match `key[index]` type path
 * eg. 'a[0]' => `['a', '0']`
 */
const REG_ARRAY_PATH = /(.+)\[(.+)]/;
const matchArrayPath = (
  path: string
): { matched: boolean; result?: [string, string] } => {
  const result = path.match(REG_ARRAY_PATH);
  if (!result) {
    return { matched: false };
  }
  return {
    matched: true,
    result: [result[1], result[2]],
  };
};

/**
 * split path string to path array
 * eg.  'a.b.c' => ['a', 'b', 'c']
 *      'a.b[0].c' => ['a', '#b#', '0', 'c']
 */
const pathToKeys = (path: string): string[] =>
  path
    .split('.')
    .filter((p) => p !== '')
    .map((p) => {
      const { matched, result: arrayPath } = matchArrayPath(p);
      if (!matched || !arrayPath) {
        return p;
      }
      return [`#${arrayPath[0]}#`, arrayPath[1]];
    })
    .flat();

export const $set = (
  obj: { [key: string]: any },
  path: string,
  value?: any
) => {
  const keys = pathToKeys(path);
  const lastIndex = keys.length - 1;

  keys.reduce((parent, key, index) => {
    const { matched, result: arrayKey } = matchArrayKey(key);

    if (matched && arrayKey) {
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

export const $delete = (obj: { [key: string]: any }, path: string) => {
  const keys = pathToKeys(path);
  const lastIndex = keys.length - 1;
  keys.reduce((parent, key, index) => {
    if (parent === undefined) {
      return undefined;
    }

    const { matched, result: arrayKey } = matchArrayKey(key);
    if (matched && arrayKey) {
      return parent[arrayKey];
    }

    if (index === lastIndex) {
      Vue.delete(parent, key);
    }

    return parent[key];
  }, obj);
};
