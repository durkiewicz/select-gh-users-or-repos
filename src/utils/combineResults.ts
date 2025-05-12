export function combineArrays<T extends Record<string, unknown>>({
  arrays,
  sortBy,
  limit,
}: {
  arrays: T[][];
  sortBy: keyof T;
  limit?: number;
}): T[] {
  if (limit != null && limit < 0) {
    throw new Error('Limit must be a non-negative number');
  }
  const combined = arrays.flat();
  const sorted = combined.sort((a, b) => {
    if (!(sortBy in a) || !(sortBy in b)) {
      throw new Error(`Property ${String(sortBy)} not found in some objects`);
    }
    if (a[sortBy] < b[sortBy]) return -1;
    if (a[sortBy] > b[sortBy]) return 1;
    return 0;
  });
  return limit == null ? sorted : sorted.slice(0, limit);
}
