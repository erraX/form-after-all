import Vue from 'vue';
import { $set } from '../../src/utils';

describe('$set', () => {
  it('should deep set to empty object', () => {
    const obj = Vue.observable({});
    $set(obj, 'a.b.c', 1);
    expect(obj).toEqual({
      a: {
        b: {
          c: 1,
        },
      },
    });
  });

  it('should deep set to empty array', () => {
    const arr = Vue.observable([]);
    $set(arr, '0.b.c[1].d', 1);
    expect(arr).toEqual([
      {
        b: {
          c: [
            undefined,
            {
              d: 1,
            },
          ],
        },
      },
    ]);
  });

  it('should deep set array value', () => {
    const obj = Vue.observable({});
    $set(obj, 'a[0].b', 1);
    expect(obj).toEqual({
      a: [
        {
          b: 1,
        },
      ],
    });
  });

  it('should deep set last key array value', () => {
    const obj = Vue.observable({});
    $set(obj, 'a[0].b[0]', 1);
    expect(obj).toEqual({
      a: [
        {
          b: [1],
        },
      ],
    });
  });

  it('should override exists value', () => {
    const obj = Vue.observable({
      a: [
        {
          foo: 'foo',
          bar: 'bar',
        },
      ],
    });
    $set(obj, 'a[0].foo', 'next foo');
    expect(obj).toEqual({
      a: [
        {
          foo: 'next foo',
          bar: 'bar',
        },
      ],
    });
  });
});
