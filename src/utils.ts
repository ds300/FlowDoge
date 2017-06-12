import { types, IType } from "mobx-state-tree"
import { autorun } from "mobx"
import AppStore from "./AppStore"

export function stringEnum<T extends string>(...o: T[]): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}

export function Effect<Type extends string>(
  type: Type,
): IType<{ type: Type }, { type: Type }> & { type: Type }
export function Effect<Type extends string, T>(
  type: Type,
  propsType: { [K in keyof T]: T[K] | IType<any, T[K]> },
): IType<{ type: Type; props: T }, { type: Type; props: T }> & {
  create(props: T): { type: Type; props: T }
} & { type: Type }
export function Effect() {
  const Eff = arguments.length === 1
    ? types.model(arguments[0], { type: types.string })
    : types.model(arguments[0], {
        type: types.string,
        props: types.model(arguments[1]),
      })
  Object.assign(Eff, { type: arguments[0] })
  const type = arguments[0]
  const superCreate = Eff.create
  if (arguments.length === 2) {
    Object.assign(Eff, {
      create(props: any) {
        return superCreate.call(Eff, { type, props })
      },
    })
  } else {
    Object.assign(Eff, {
      create() {
        return superCreate.call(Eff, { type })
      },
    })
  }
  return Eff as any
}

export function runEffects(
  appStore: AppStore,
  store: { effects: Array<{ type: string }> },
  effectsExecutors: { [type: string]: any },
): void {
  autorun(() => {
    if (store.effects.length) {
      store.effects.forEach(eff => {
        log.info("running effect", eff.type)
        try {
          effectsExecutors[eff.type](eff, store, appStore)
        } catch (e) {
          log.error(e)
        }
      })
      store.effects = []
    }
  })
}

const chars = "abcdefghijklmnopqrstuvwxyz0123456789"

export function unsecureRandomString(length: number = 3): string {
  if (length < 0 || length > 2000000) {
    throw new Error(`What you is doing. Number bad: ${length}`)
  }
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export interface Log {
  log: typeof console.error
  error: typeof console.error
  warn: typeof console.error
  dir: typeof console.error
  info: typeof console.error
}
/* tslint:disable */
const noop = () => {}
export const log: Log = __DEV__
  ? console
  : { log: noop, error: noop, warn: noop, dir: noop, info: noop }
