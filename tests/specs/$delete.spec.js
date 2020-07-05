import { $delete } from '../../src/utils';

describe('$delete', () => {
  it('should delete deep object value', () => {
    const obj = {
      a: {
        b: {
          c: 1,
          d: 2,
        },
        o: {},
      },
    };

    $delete(obj, 'a.b.c');
    expect(obj).toEqual({
      a: {
        b: {
          d: 2,
        },
        o: {},
      },
    });

    $delete(obj, 'a.b');
    expect(obj).toEqual({
      a: {
        o: {},
      },
    });

    $delete(obj, 'a.b.c.s.a.d.d');
    expect(obj).toEqual({
      a: {
        o: {},
      },
    });

    $delete(obj, '1122.b.c.s.a.d.d');
    expect(obj).toEqual({
      a: {
        o: {},
      },
    });
  });

  it('should also support delete array', () => {
    const obj = {
      a: {
        b: {
          c: [
            {
              foo: 'foo',
              bar: 'bar',
            },
          ],
        },
      },
    };

    $delete(obj, 'a.b.c[0].foo');
    expect(obj).toEqual({
      a: {
        b: {
          c: [
            {
              bar: 'bar',
            },
          ],
        },
      },
    });
  });

  it('should splice array item', () => {
    const obj = {
      a: {
        b: [
          {
            foo1: 'foo1',
            bar1: 'bar1',
          },
          {
            foo2: 'foo2',
            bar2: 'bar2',
          },
        ],
      },
    };

    $delete(obj, 'a.b[1]');
    expect(obj).toEqual({
      a: {
        b: [
          {
            foo1: 'foo1',
            bar1: 'bar1',
          },
        ],
      },
    });

    $delete(obj, 'a.b[0]');
    expect(obj).toEqual({
      a: {
        b: [],
      },
    });

    $delete(obj, 'a.b[99]');
    expect(obj).toEqual({
      a: {
        b: [],
      },
    });
  });
});
