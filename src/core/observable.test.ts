import Observable from './observable';

describe('Observable', () => {
  it('emits update on change', () => {
    const observable = new Observable('{VALUE}');
    const listener = jest.fn();
    observable.subscribe(listener);
    observable.value = '{NEW_VALUE}';
    expect(listener).toBeCalledTimes(1);
    expect(listener).toBeCalledWith('{NEW_VALUE}');
  });
});
