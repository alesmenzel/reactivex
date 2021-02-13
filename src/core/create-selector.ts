import Observable from './observable';

export interface Calculation<TInput, TReturn = TInput> {
  (value: TInput): TReturn;
}

interface ObservableByKey<TValue> {
  [key: string]: Observable<TValue>;
}

interface ObservableValuesByKey<TValue> {
  [key: string]: TValue;
}

export interface Comparison<TValue> {
  (value: TValue, newValue: TValue): boolean;
}

// TODO: type this shit somehow with generics
function defaultCalculation(value: any) {
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
 * @param {ObservableByKey<TObservableValues>} observablesByKey
 * @param {Calculation<ObservableValuesByKey<TObservableValues>, TObservableOutput>} [calculation=strictComparison]
 * @param {(value: TObservableOutput, newValue: TObservableOutput) => boolean} [comparison=defaultComparison]
 */
function createSelector<TObservableValues, TObservableOutput>(
  observablesByKey: ObservableByKey<TObservableValues>,
  calculation: Calculation<ObservableValuesByKey<TObservableValues>, TObservableOutput> = defaultCalculation,
  comparison: Comparison<TObservableOutput> = strictComparison
): Observable<TObservableOutput> {
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
