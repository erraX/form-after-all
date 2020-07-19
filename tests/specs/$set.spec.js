import { ref } from '@vue/composition-api';
import { $set } from '../../src/utils';
import { isReactive } from '../utils';

describe('$set', () => {
  it('should deep set to empty object', () => {
    const obj = ref({});
    $set(obj.value, 'a.b.c', 1);
    expect(obj.value).toEqual({ a: { b: { c: 1 } } });
    expect(isReactive(obj.value.a.b, 'c')).toBe(true);
  });

  it('should deep set to empty array', () => {
    const arr = ref([]);
    $set(arr.value, '0.b.c[1].d', 1);
    expect(arr.value).toEqual([
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
    expect(isReactive(arr.value[0].b.c[1], 'd')).toBe(true);
  });

  it('should deep set array value', () => {
    const obj = ref({});
    $set(obj.value, 'a[0].b', 1);
    expect(obj.value).toEqual({
      a: [
        {
          b: 1,
        },
      ],
    });
    expect(isReactive(obj.value.a[0], 'b')).toBe(true);
  });

  it('should deep set last key array value', async () => {
    const obj = ref({});
    $set(obj.value, 'a[0].b[0]', 1);
    expect(obj.value).toEqual({
      a: [
        {
          b: [1],
        },
      ],
    });
  });

  it('should override exists value', () => {
    const obj = ref({
      a: [
        {
          foo: 'foo',
          bar: 'bar',
        },
      ],
    });
    $set(obj.value, 'a[0].foo', 'next foo');
    expect(obj.value).toEqual({
      a: [
        {
          foo: 'next foo',
          bar: 'bar',
        },
      ],
    });
    expect(isReactive(obj.value.a[0], 'foo')).toBe(true);
  });

  it.skip('should delete object type parent value when value is undefined', () => {
    const obj = ref({
      a: [
        {
          foo: 'foo',
          bar: 'bar',
        },
      ],
    });
    $set(obj.value, a[0].foo);
    expect(obj.value).toEqual({
      a: [
        {
          bar: 'bar',
        },
      ],
    });
  });

  it.skip('should delete array type parent value when value is undefined', () => {
    const obj = ref({
      a: [
        {
          foo: 'foo',
          bar: 'bar',
        },
      ],
    });
    $set(obj.value, a[0]);
    expect(obj.value).toEqual({});
  });
});
