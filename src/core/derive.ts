import { IAtom, atom, AtomOptions } from './atom';

export type AtomsByKey<Value> = {[key: string]: IAtom<Value>}
export type AtomValuesByKey<Value> = {[key: string]: Value}
export type SelectObject<AtomValuesByKey, Return = AtomValuesByKey> = (value: AtomValuesByKey) => Return
export type SelectArray<AtomValues, Return = AtomValues> = (...values: AtomValues[]) => Return

/**
 * Default select that simply returns the input
 */
export function defaultSelect<Value, Return>(value: Value): Return {
  return value as unknown as Return
}

/**
 * Transform object of atoms into a object of atom's values
 */
export function getAtomValuesAsObject<Values> (keys: string[], atoms: AtomsByKey<Values>) {
  return keys.reduce((acc, key) => {
    acc[key] = atoms[key].value
    return acc
  }, {} as AtomValuesByKey<Values>);
}

/**
 * Transform array of atoms into array of atom's values
 * @param atoms
 * @returns
 */
export function getAtomValuesAsArray<Values> (atoms: IAtom<Values>[]) {
  return atoms.map(atom => atom.value)
}

/**
 * Create observable selector
 * @example
 * ```js
 * const sum = selector(
 *   [atom(42), atom(100), atom(200)],
 *   (a, b, c) => a + b + c
 * )
 *
 * // Pass options to the selector atom
 * const sum = selector(
 *   [atom(42), atom(100), atom(200)],
 *   (a, b, c) => a + b + c
 *   { isEqual: _.isEqual } // Uses lodash's deep equal to compare derived value to its previous value
 * )
 * ```
 */
export function derive<Values, DerivedValue>(
  atoms: IAtom<Values>[],
  // eslint-disable-next-line default-param-last
  select: SelectArray<Values, DerivedValue> = defaultSelect,
  options?: AtomOptions<DerivedValue>
): IAtom<DerivedValue> {
  const derivedAtom = atom(select(...getAtomValuesAsArray(atoms)), options);
  // subscribe to passed atoms
  atoms.forEach((atom) => {
    atom.subscribe(() => {
      derivedAtom.set(select(...getAtomValuesAsArray(atoms)));
    });
  });

  return derivedAtom;
}

/**
 * Create observable selector
 * @example
 * ```js
 * const sum = deriveStructured({
 *     a: atom(42),
 *     b: atom(100),
 *     c: atom(200)
 *   },
 *   ({ a, b, c }) => a + b + c,
 * )
 *
 * // Pass options to the selector atom
 * const sum = deriveStructured({
 *     a: atom(42),
 *     b: atom(100),
 *     c: atom(200)
 *   },
 *   ({ a, b, c }) => a + b + c,
 *   { isEqual: _.isEqual } // Uses lodash's deep equal to compare derived value to its previous value
 * )
 * ```
 */
 export function deriveStructured<Values, DerivedValue>(
  atomsByKey: AtomsByKey<Values>,
  // eslint-disable-next-line default-param-last
  select: SelectObject<AtomValuesByKey<Values>, DerivedValue> = defaultSelect,
  options?: AtomOptions<DerivedValue>
): IAtom<DerivedValue> {
  const keys = Object.keys(atomsByKey);

  const derivedAtom = atom(select(getAtomValuesAsObject(keys, atomsByKey)), options);
  // subscribe to passed atoms
  keys.forEach((key) => {
    atomsByKey[key].subscribe(() => {
      derivedAtom.set(select(getAtomValuesAsObject(keys, atomsByKey)));
    });
  });

  return derivedAtom;
}
