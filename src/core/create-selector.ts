import Observable from './observable';

interface Calculation<TInput, TReturn> {
  (value: TInput): TReturn;
}

interface ObservableByKey<TValue> {
  [key: string]: Observable<TValue>;
}

interface ObservableValuesByKey<TValue> {
  [key: string]: TValue;
}

interface Comparison<TValue> {
  (value: TValue, newValue: TValue): boolean;
}

function defaultCalculation<TValue>(
  value: ObservableValuesByKey<TValue>
): ObservableValuesByKey<TValue> {
  return value;
}

function strictComparison<TValue>(value: TValue, newValue: TValue) {
  return value === newValue;
}

/**
 * Create observable selector
 * @example
 * ```js
 * const observable = selector({
 *     a: observable(42),
 *     b: observable(100),
 *     c: observable(200)
 *   },
 *   ({ a, b, c }) => a + b + c,
 *   (value, newValue) => value === newValue
 * )
 * ```
 * @param {ObservableByKey<TValue>} observablesByKey
 * @param {Calculation<ObservableValuesByKey<TValue>, TReturn>} [calculation=strictComparison]
 * @param {(value: any, newValue: any) => boolean} [comparison=defaultComparison]
 */
function createSelector<TValue, TReturn>(
  observablesByKey: ObservableByKey<TValue>,
  calculation: Calculation<ObservableValuesByKey<TValue>, any> = defaultCalculation,
  comparison: Comparison<any> = strictComparison
): Observable<TReturn> {
  const keys = Object.keys(observablesByKey);
  const observables = Object.values(observablesByKey);
  function getObservableValue() {
    return keys.reduce((acc, key) => ({ ...acc, [key]: observablesByKey[key].value }), {});
  }
  const obs = Observable.from(calculation(getObservableValue()));
  observables.forEach((observable) => {
    observable.subscribe(() => {
      const newValue = calculation(getObservableValue());
      if (!comparison(obs.value, newValue)) {
        obs.set(newValue);
      }
    });
  });
  return obs;
}

export default createSelector;
