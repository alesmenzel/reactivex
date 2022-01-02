import Atom, { atom, AtomOptions } from './atom';
import { AtomValuesByKey, AtomsByKey } from "./types"

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
 */
export function getAtomValuesAsArray<Values> (atoms: Atom<Values>[]) {
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
export function derive<Value, DerivedValue>(
  atoms: Atom<Value>[],
  select: (...values: Value[]) => DerivedValue,
  options: AtomOptions<DerivedValue> | undefined = undefined
): Atom<DerivedValue> {
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
  select: SelectObject<AtomValuesByKey<Values>, DerivedValue> = defaultSelect,
  options: AtomOptions<DerivedValue> | undefined = undefined
): Atom<DerivedValue> {
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
