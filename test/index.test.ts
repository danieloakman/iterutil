import { ok as assert, deepStrictEqual as equal, notDeepStrictEqual as notEqual, throws } from 'assert';
import {
  isIterable,
  isIterator,
  iter,
  concat,
  range,
  enumerate,
  flatten,
  toIterator,
  zip,
  zipLongest,
} from '../src/index';

describe('ExtendedIterator', function () {
  it('toString', async function () {
    equal(iter([]).toString(), 'ExtendedIterator');
  });

  it('map', async function () {
    equal(
      iter([1, 2, 3])
        .map(n => n * n)
        .map(n => n.toString())
        .toArray(),
      ['1', '4', '9'],
    );
  });

  it('filter', async function () {
    equal(
      iter([1, 2, 3])
        .filter(n => n % 2 === 0)
        .toArray(),
      [2],
    );
    equal(
      iter([1, 2, 3])
        .filter(n => n < 0)
        .toArray(),
      [],
    );
    equal(iter([]).filter(Boolean).toArray(), []);
  });

  it('reduce', async function () {
    const sum = (a: any, b: any) => a + b;
    equal(iter([1, 2, 3]).reduce(sum, 0), 6);
    equal(iter([1, 2, 3, 4]).reduce(sum), 10);
    equal(iter([1, 2, 3]).reduce(sum, ''), '123');
  });

  it('concat', async function () {
    equal(
      iter([1, 2, 3])
        .concat(iter([4, 5, 6]))
        .toArray(),
      [1, 2, 3, 4, 5, 6],
    );
  });

  it('slice', async function () {
    const arr = [1, 2, 3, 4, 5];
    equal(iter(arr).slice(2, 4).toArray(), arr.slice(2, 4));
    equal(iter(arr).slice(2).toArray(), arr.slice(2));
    notEqual(iter(arr).slice(2, -1).toArray(), arr.slice(2, -1));
    equal(iter(arr).slice().toArray(), arr.slice());
  });

  it('flatten', async function () {
    equal(
      iter([1, [2], [[3]]])
        .flatten(1)
        .toArray(),
      [1, 2, [3]],
    );
    equal(
      iter([1, [2], [[3]]])
        .flatten(2)
        .toArray(),
      [1, 2, 3],
    );
    equal(
      iter([[[1, [2], [[3]]]]])
        .flatten()
        .toArray(),
      [1, 2, 3],
    );
  });

  it('every & some', async function () {
    equal(
      iter([1, 2, 3]).every(n => n % 2 === 0),
      false,
    );
    equal(
      iter([2, 4, 6]).every(n => n % 2 === 0),
      true,
    );
    equal(
      iter([1, 2, 3]).some(n => n % 2 === 0),
      true,
    );
    equal(
      iter([1, 2, 3]).some(n => n > 3),
      false,
    );
  });

  it('enumerate', async function () {
    equal(
      iter([1, 2, 3])
        .enumerate()
        .map(([i, n]) => [i, n * n])
        .toArray(),
      [[0, 1], [1, 4], [2, 9]],
    );
  });

  it('zip & zipLongest', async function () {
    equal(
      iter([1, 2, 3])
        .zip(iter([4, 5]))
        .toArray(),
      [
        [1, 4],
        [2, 5],
      ],
    );
    equal(
      iter([1, 2, 3])
        .zipLongest(iter([4, 5]))
        .toArray(),
      [
        [1, 4],
        [2, 5],
        [3, undefined],
      ],
    );
  });

  it('take', async function () {
    equal(iter([1, 2, 3]).take(2).toArray(), [1, 2]);
    equal(iter([1, 2, 3]).take(0).toArray(), []);
  });

  it('skip', async function () {
    equal(iter([1, 2, 3]).skip(2).toArray(), [3]);
    equal(iter([1, 2, 3]).skip(0).toArray(), [1, 2, 3]);
  });

  it('pairwise', async function () {
    equal(iter([1, 2, 3]).pairwise().toArray(), [
      [1, 2],
      [2, 3],
    ]);
    equal(iter([1, 2]).pairwise().toArray(), [[1, 2]]);
    equal(iter([1]).pairwise().toArray(), []);
    equal(iter([]).pairwise().toArray(), []);
  });

  it('join', async function () {
    equal(iter([1, 2, 3]).join(), '1,2,3');
    equal(iter([1, 2, 3]).join(''), '123');
    equal(iter([1, 2, 3]).join('-'), '1-2-3');
  });

  it('find', async function () {
    equal(iter([1, 2, 3]).find(n => n > 2), 3);
    equal(iter([1, 2, 3]).find(n => n > 4), undefined);
  });

  it('exhaust', async function () {
    let mapWasCalled = 0;
    const f = (n: number) => {
      mapWasCalled++;
      return n;
    };
    equal(iter([1, 2, 3]).map(f).exhaust(), undefined);
    equal(mapWasCalled, 3);
    const iterator = iter([1, 2, 3]);
    mapWasCalled = 0;
    equal(iterator.map(f).exhaust(2), undefined);
    equal(mapWasCalled, 2);
    equal(iterator.toArray(), [3]);
  });

  it('peek', async function () {
    const iterator = iter([1, 2, 3, 4, 5]);
    equal(iterator.peek(), 1);
    equal(iterator.peek(1), [1]);
    equal(iterator.peek(3), [1, 2, 3]);
    equal(iterator.toArray(), [1, 2, 3, 4, 5]);
    equal(iterator.peek(), undefined);
    equal(iterator.peek(3), []);
    equal(iter([1]).peek(2), [1]);
  });

  it('yield', async function () {
    const iterator = iter([1, 2, 3, 4, 5]);
    equal(iterator.yield(), 1);
    equal(iterator.yield(2), [2, 3]);
    equal(iterator.yield(1), [4]);
    equal(iterator.toArray(), [5]);
    equal(iterator.yield(), undefined);
    equal(iterator.yield(3), []);
    equal(iter([1]).yield(2), [1]);
  });

  it('toSet', async function () {
    const nums = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const set = iter(nums)
      .filter(n => n % 2 === 0)
      .toSet();
    assert(nums.filter(n => n % 2 === 0).every(n => set.has(n)));
  });

  it('toMap', async function () {
    const map = range(10)
      .map(n => [n, n * 2])
      .toMap<number, number>();
    range(10).forEach(n => assert(map.get(n) === n * 2));
  });
});

it('isIterable', async function () {
  assert(isIterable([1, 2, 3]));
  assert(isIterable('abc'));
  assert(isIterable(new Set([1, 2, 3])));
  assert(
    isIterable(
      new Map([
        [1, 2],
        [3, 4],
      ]),
    ),
  );
  assert(isIterable(new Int8Array([1, 2, 3])));
  assert(isIterable(Buffer.from('abc')));
  assert(!isIterable(null));
});

it('isIterator', async function () {
  assert(
    isIterator(
      (function* () {
        yield 1;
      })(),
    ),
  );
  assert(isIterator({ next() {} }));
  assert(!isIterator(null));
});

it('toIterator', async function () {
  const i = toIterator([1, 2, 3]);
  assert(isIterator(i));
  throws(() => toIterator(null));
});

it('zip', async function () {
  equal(zip([1, 2, 3], ['4', '5', '6']).toArray(), [
    [1, '4'],
    [2, '5'],
    [3, '6'],
  ]);
  equal(zip([1, 2, 3], ['4', '5']).toArray(), [
    [1, '4'],
    [2, '5'],
  ]);
});

it('zipLongest', async function () {
  equal(zipLongest([1, 2, 3], ['4', '5', '6']).toArray(), [
    [1, '4'],
    [2, '5'],
    [3, '6'],
  ]);
  equal(zipLongest([1, 2, 3], ['4', '5']).toArray(), [
    [1, '4'],
    [2, '5'],
    [3, undefined],
  ]);
});

it('iter', async function () {
  equal(
    iter([1, 2, 3])
      .map(n => n * n)
      .toArray(),
    [1, 4, 9],
  );
  equal(
    iter({ a: 1, b: 2, c: 3 })
      .map(v => [v[0], v[1] * 2])
      .toArray(),
    [
      ['a', 2],
      ['b', 4],
      ['c', 6],
    ],
  );
  // Probably won't end up handling this, as it would slow down `iter` a bit.
  throws(() => iter({ next() {} }).toArray());
});

it('concat', async function () {
  equal(concat([1, 2, 3], [], [4, 5, 6]).toArray(), [1, 2, 3, 4, 5, 6]);
});

it('range', async function () {
  equal([...range(5, 10, 2)], [5, 7, 9]);
  equal([...range(5, 10)], [5, 6, 7, 8, 9]);
  equal([...range(5, 0, -1)], [5, 4, 3, 2, 1]);
  equal([...range(5, 0, -3)], [5, 2]);
  equal([...range(5, 0, -4)], [5, 1]);
  equal([...range(5, -5, -2)], [5, 3, 1, -1, -3]);
  equal([...range(4, -1)], [4, 3, 2, 1, 0]);
  equal([...range(10, 10)], []);
  equal([...range(10)], [...range(0, 10, 1)]);
  equal([...range(10)], range(10).toArray());
  equal(range(2, 1, 1).toArray(), []);
  equal(range(Infinity).take(10).toArray(), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  equal(range(-Infinity).take(10).toArray(), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]);
  equal(range(1, 0).toArray(), [1]);
  equal(range(10, 0, 1).toArray(), []);
  equal(range(10).nth(-1), 9);
  equal(range(10).nth(10), undefined);
  equal(range(10).nth(Infinity), undefined);
  equal(range(10).nth(-10), 0);
  equal(range(10).nth(-11), undefined);
  let r = range(3);
  equal([...r, ...r], [0, 1, 2, 0, 1, 2]);
  assert(range(3).equal(range(0, 3, 1)));
  // @ts-ignore
  assert(range().toArray(), []);
  // Is still subject to floating numbers rounding errors:
  throws(() => equal(range(0, 5, 0.3).toArray(), [0, .3, .6, .9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.7]));

  for (const args of [[10], [-10], [0, 10, 2], [0, -10, -2], [2, 10, 3], [-10, 0], [10, 0], [10, 0, 1], [0, 5, 0.25]] as [
    number,
    number,
    number,
  ][]) {
    r = range(...args);
    const nums = r.toArray();
    assert(
      nums.every(n => r.includes(n)),
      `${nums} should be a subset of ${r}`,
    );
    assert(!r.includes(Math.min(...nums) - 1));
    assert(!r.includes(Math.max(...nums) + 1));
    equal(nums.length, r.length, `[${nums}] should have the same length as ${r}`);
    assert(nums.every((n, i) => n === r.nth(i) && r.index(n) === i));
  }
});

it('flatten', async function () {
  equal(flatten([[1], [2, 3]]).toArray(), [1, 2, 3]);
  equal(flatten([[1], [2, 3], [4, 5]]).toArray(), [1, 2, 3, 4, 5]);
  equal(flatten([[1], [[2], 3]], 2).toArray(), [1, 2, 3]);
  equal(flatten([[1], [[2], 3]], 1).toArray(), [1, [2], 3]);
  equal(flatten([[1], [[2], 3]], 0).toArray(), [[1], [[2], 3]]);
});

it('enumerate', async function () {
  equal(enumerate([{ a: 1 }, { b: 2 }]).toArray(), [
    [0, { a: 1 }],
    [1, { b: 2 }],
  ]);
});
