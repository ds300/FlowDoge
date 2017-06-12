import AuthStore, { initialState as authInitialState } from "./auth/AuthStore"
import authEffectHandlers from "./auth/AuthEffects"
import { types } from "mobx-state-tree"
import { runEffects } from "./utils"

const initialState = {
  auth: authInitialState,
}

export const AppStore = types.model({
  auth: AuthStore,
})

export type AppStore = typeof AppStore.Type

export default AppStore

export function create() {
  return AppStore.create(initialState)
}

export function bootstrap(store: AppStore) {
  runEffects(store, store.auth, authEffectHandlers)
}
