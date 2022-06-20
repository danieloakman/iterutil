import { setupSuite } from './bm-util';

// function getRandInt (min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

const suite = setupSuite('iter');
// import { range, iterate, iterate2, ExtendedIterator, IteratorWithOperators } from '../../utils/iterutil';
import ExtendedIterator from '../src/ExtendedIterator';
import { IteratorWithOperators } from 'iterare/lib/iterate';
import { iterplus } from 'iterplus';

function* nums(size: number) {
  for (let i = 0; i < size; i++) yield i;
}

for (const size of [1e4, 1e5, 1e6]) {
  suite.add(`IteratorWithOperators ${size}`, () => {
    new IteratorWithOperators(nums(size))
      .map(x => x * x)
      // .filter(x => x % 2 !== 0)
      .map(x => x.toString())
      .toArray();
  });
  suite.add(`ExtendedIterator ${size}`, () => {
    new ExtendedIterator(nums(size))
      .map(x => x * x)
      // .filter(x => x % 2 !== 0)
      .map(x => x.toString())
      .collect;
  });
  suite.add(`iterplus ${size}`, () => {
    iterplus(nums(size))
      .map(x => x * x)
      // .filter(x => x % 2 !== 0)
      .map(x => x.toString())
      .collect();
  });
  // bm.add(`iterate2.map2 ${size}`, () => {
  //     const a = iterate2(nums(size))
  //         .map2(x => x * x)
  //         .map2(x => x.toString())
  //         .toArray();
  // });
  // bm.add(`iterate2.map3 ${size}`, () => {
  //     const a = iterate2(nums(size))
  //         .map3(x => x * x)
  //         .map3(x => x.toString())
  //         .toArray();
  // });
}
suite.run({
  async: true,
});
