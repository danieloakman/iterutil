import concat from './concat';
import {
  FlattenDeep,
  FlattenDepth1,
  IteratorOrIterable,
  FlattenDepth2,
  FlattenDepth3,
  FlattenDepth4,
  FlattenDepth5,
} from './types';
import flatten from './flatten';

export class ExtendedIterator<T> {
  protected readonly iterator: Iterator<T>;

  public constructor(iterator: Iterator<T>);
  public constructor(iterator: { iterator?: Iterator<any>; next?: () => IteratorResult<any> });
  public constructor(iterator: any) {
    this.iterator = iterator;
  }

  /** Returns a `{ value, done }` object that adheres to the Iterator protocol */
  public next() {
    return this.iterator.next();
  }

  /** Implements this as an Iterable so it's allowed to be used with "for of" loops. */
  public [Symbol.iterator]() {
    return this.iterator;
  }

  /** Returns a new ExtendedIterator that maps each element in this iterator to a new value. */
  public map<R>(iteratee: (value: T) => R) {
    return new ExtendedIterator<R>({
      iterator: this.iterator,
      next() {
        const { value, done } = this.iterator.next();
        return { value: done ? undefined : iteratee(value), done } as IteratorResult<R>;
      },
    });
  }

  /**
   * Returns a new ExtendedIterator that filters each element in this iterator.
   * @param predicate A function that returns a truthy value to indicate to keep that value.
   */
  public filter(predicate: (element: T) => any) {
    return new ExtendedIterator<T>({
      iterator: this.iterator,
      next() {
        let result: IteratorResult<T>;
        do result = this.iterator.next();
        while (!result.done && !predicate(result.value));
        return result;
      },
    });
  }

  /** Iterate over this iterator using the `array.protype.forEach` style of method. */
  public forEach(callback: (value: T) => void) {
    for (const value of this) callback(value);
  }

  /** Reduces this iterator to a single value. */
  public reduce(reducer: (accumulator: T, value: T) => T): T;
  public reduce<R>(reducer: (accumulator: R, value: T) => R, initialValue: R): R;
  public reduce<R>(reducer: (accumulator: R | T, value: T) => R, initialValue?: R): R {
    let accumulator = initialValue ?? this.iterator.next().value;
    for (const value of this) accumulator = reducer(accumulator, value);
    return accumulator;
  }

  public concat<A>(other: IteratorOrIterable<A>): ExtendedIterator<T | A>;
  public concat<A, B>(a: IteratorOrIterable<A>, b: IteratorOrIterable<B>): ExtendedIterator<T | A | B>;
  public concat(...args: IteratorOrIterable<any>[]): ExtendedIterator<any>;
  public concat(...args: IteratorOrIterable<any>[]): ExtendedIterator<any> {
    return concat(this, ...args);
  }

  /**
   * Works like `Array.prototype.slice`, returns a new slice of this iterator.
   * @note This does not support negative `start` and `end` indices, as it's not possible to know the length of the
   * iterator while iterating.
   * @param start The index to start at (inclusive).
   * @param end The index to end at (exclusive).
   * @returns A new ExtendedIterator that only includes the elements between `start` and `end`.
   */
  public slice(start = 0, end = Infinity) {
    let i = 0;
    return new ExtendedIterator({
      iterator: this.iterator,
      next() {
        let result: IteratorResult<T>;
        while (!(result = this.iterator.next()).done && i++ < start);
        if (i <= end) return result;
        return { done: true, value: undefined };
      },
    });
  }

  /**
   * Flatten this iterator.
   * @param depth The number of levels to flatten (default: Infinity, i.e. deeply).
   */
  public flatten(depth: 1): ExtendedIterator<FlattenDepth1<T>>;
  public flatten(depth: 2): ExtendedIterator<FlattenDepth2<T>>;
  public flatten(depth: 3): ExtendedIterator<FlattenDepth3<T>>;
  public flatten(depth: 4): ExtendedIterator<FlattenDepth4<T>>;
  public flatten(depth: 5): ExtendedIterator<FlattenDepth5<T>>;
  public flatten(): ExtendedIterator<FlattenDeep<T>>;
  public flatten(depth: number): ExtendedIterator<any>;
  public flatten(depth = Infinity) {
    return flatten<T>(this, depth);
  }

  /** Attaches the index to each value as a pair like: `[0, value], [1, value]`, etc. */
  public enumerate(): ExtendedIterator<[number, T]> {
    return this.map(((count = 0) => v => [count++, v])()); // prettier-ignore
  }

  /**
   * Take the first `n` elements from this iterator.
   * @param n The number of elements to take.
   */
  public take(n: number) {
    return this.slice(0, n);
  }

  /** Iterates and collects all values into an Array. This essentially invokes this iterator to start iterating. */
  public toArray(): T[] {
    const result: T[] = [];
    let next: IteratorResult<T>;
    while (!(next = this.iterator.next()).done) result.push(next.value);
    return result;
  }

  /** Shorthand for `new Set(this)`. */
  public toSet() {
    return new Set(this);
  }

  /**
   * Shorthand for `new Map<K, V>(this)`. Must specify the types to get the correct type back,
   * e.g. `iterator.toMap<string, number>();`
   */
  public toMap<K, V>(): Map<K, V>;
  public toMap<KV>(): Map<KV, KV>;
  public toMap<K, V>() {
    return new Map<K, V>(this as any);
  }
}

export default ExtendedIterator;
