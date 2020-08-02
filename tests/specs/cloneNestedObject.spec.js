import { get } from 'lodash-es';
import { cloneNestedObject } from '../../src/utils';

describe('cloneNestedObject', () => {
  it('should not set nested object while `cloneIf` always returns `false`', () => {
    const foo = { a: { b: 1 } };
    const response = cloneNestedObject(foo, () => false);
    expect(response).toEqual({});
  });

  it('should set nested object', () => {
    const foo = {
      a: {
        b: 'b',
        foo: [{ nested1: 'nested1' }, { nested2: 'nested2' }],
      },
    };
    const active = {
      a: {
        b: false,
        foo: [{ nested1: true }, { nested1: false }],
      },
    };

    const response = cloneNestedObject(
      foo,
      (paths) => get(active, paths) === true
    );
    expect(response).toEqual({
      a: {
        foo: [{ nested1: 'nested1' }],
      },
    });
  });
});
