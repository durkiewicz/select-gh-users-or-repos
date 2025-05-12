import { combineArrays } from './combineResults';
import { describe, expect, it } from '@jest/globals';

describe('combineArrays', () => {
  it.each([
    { arrays: [], expected: [], limit: undefined },
    { arrays: [[], [], []], expected: [], limit: undefined },
    { arrays: [[{ id: 1 }]], expected: [{ id: 1 }], limit: undefined },
    { arrays: [[{ id: 1 }]], expected: [], limit: 0 },
    {
      arrays: [[{ id: 2 }], [{ id: 1 }]],
      expected: [{ id: 1 }, { id: 2 }],
      limit: undefined,
    },
    {
      arrays: [[{ id: 2 }], [{ id: 1 }]],
      expected: [{ id: 1 }],
      limit: 1,
    },
    {
      arrays: [[{ id: null }], [{ id: undefined }]],
      expected: [{ id: null }, { id: undefined }],
      limit: undefined,
    },
    {
      arrays: [
        [{ id: 6 }, { id: 4 }, { id: 2 }],
        [{ id: 1 }, { id: 3 }, { id: 5 }],
      ],
      expected: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
      ],
      limit: undefined,
    },
    {
      arrays: [
        [{ id: 6 }],
        [{ id: 4 }, { id: 2 }],
        [{ id: 1 }, { id: 3 }, { id: 5 }],
      ],
      expected: [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
        { id: 6 },
      ],
      limit: undefined,
    },
    {
      arrays: [
        [{ id: 6 }],
        [{ id: 4 }, { id: 2 }],
        [{ id: 1 }, { id: 3 }, { id: 5 }],
      ],
      expected: [{ id: 1 }, { id: 2 }],
      limit: 2,
    },
  ])(
    'returns $expected when arrays are $arrays and limit is $limit',
    ({ arrays, expected, limit }) => {
      const result = combineArrays<{ id: number | undefined | null }>({
        arrays,
        sortBy: 'id',
        limit,
      });
      expect(result).toEqual(expected);
    },
  );

  it('throws an error when the limit is negative', () => {
    expect(() => {
      combineArrays({
        arrays: [[{ id: 1 }]],
        sortBy: 'id',
        limit: -1,
      });
    }).toThrow();
  });

  it('throws an error when an object does not have the sortBy property', () => {
    expect(() => {
      combineArrays({
        arrays: [[{ id: 1 }], [{ name: 'test' }]],
        sortBy: 'id',
      });
    }).toThrow();
  });
});
