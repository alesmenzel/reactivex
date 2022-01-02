import { Listener, Unsubscribe } from "./event-emitter"
import {AtomSymbol} from "./constants"

export type SetFn<Value> = (prevValue: Value) => Value

export interface IAtom<Value> {
  [AtomSymbol]: true
  get value(): Value
  set value(value: Value)
  get(): Value
  set(value: any): this
  subscribe(listener: Listener<Value>): Unsubscribe
  unsubscribe(listener: Listener<Value>): this
}

export type AtomsByKey<Value> = {[key: string]: IAtom<Value>}
export type AtomValuesByKey<Value> = {[key: string]: Value}
export type AtomsOrValuesByKey<Value> = { [key: string]: IAtom<Value> | Value };
