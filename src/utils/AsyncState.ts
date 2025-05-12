export type AsyncState<Value, Error = unknown> =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'error'; error: Error }
  | { type: 'success'; value: Value };

export function isLoading(
  state: AsyncState<unknown>,
): state is { type: 'loading' } {
  return state.type === 'loading';
}

export function isError<Error>(
  state: AsyncState<unknown, Error>,
): state is { type: 'error'; error: Error } {
  return state.type === 'error';
}

export function isEmptySuccess(
  state: AsyncState<unknown[]>,
): state is { type: 'success'; value: never[] } {
  return state.type === 'success' && state.value.length === 0;
}

export function isNonEmptySuccess<T>(
  state: AsyncState<T[]>,
): state is { type: 'success'; value: T[] } {
  return state.type === 'success' && state.value.length > 0;
}
