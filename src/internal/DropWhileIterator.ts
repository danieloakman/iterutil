/** Drops/skips values in the input `iterator` while the predicate returns a truthy value. */
export class DropWhileIterator<T> implements IterableIterator<T> {
  protected dropped = false;

  constructor(protected iterator: Iterator<T>, protected predicate: (value: T) => any) {}

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  next(): IteratorResult<T> {
    if (this.dropped) return this.iterator.next();
    let next: IteratorResult<T>;
    do next = this.iterator.next();
    while (!next.done && this.predicate(next.value));
    this.dropped = true;
    return next;
  }
}

export default DropWhileIterator;
