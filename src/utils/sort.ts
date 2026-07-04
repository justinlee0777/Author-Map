import sortBy from 'lodash-es/sortBy';

export function sortMap<Key, Value, SortValue>(
  map: Map<Key, Value>,
  comparatorFn: ([key, value]: [Key, Value]) => SortValue,
): Map<Key, Value> {
  const sortedEntries = sortBy([...map.entries()], comparatorFn);

  return new Map(sortedEntries);
}
