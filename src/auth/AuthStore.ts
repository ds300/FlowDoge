import { types, IType } from "mobx-state-tree"
import { AuthEffect, OpenBrowser, FetchToken } from "./AuthEffects"
import { stringEnum } from "../utils"

const State = stringEnum("idle", "awaiting_code", "awaiting_token")
type State = keyof typeof State

export const AccessToken = types.model("auth_OAuthResult", {
  access_token: types.string,
  refresh_token: types.string,
  expires_in: types.number,
  token_type: types.string,
})

export type AccessToken = typeof AccessToken.Type

export const AuthStore = types.model(
  "AuthStore",
  {
    accessToken: types.maybe(AccessToken),
    state: types.optional(types.string as IType<State, State>, "idle"),
    loginError: types.maybe(types.string),
    effects: types.array(AuthEffect),
    get loginFailed() {
      return this.loginError !== null
    },
    get isLoggedIn() {
      return !!this.accessToken
    },
    get isIdle() {
      return this.state === State.idle
    },
  },
  {
    /**
     * Begin the login sequence by launching the browser
     */
    logIn() {
      this.loginError = null
      this.state = State.awaiting_code
      this.effects.push(OpenBrowser.create())
    },

    /**
     * @param description an error message to display
     */
    logInErrorEncountered(description: string) {
      this.loginError = description
      this.state = State.idle
    },

    tokenResultCompleted(result: AccessToken) {
      this.loginError = null
      this.accessToken = result
      this.state = State.idle
    },

    appRegainedFocusAfterFlowdockLogin(state: string) {
      this.effects.push(FetchToken.create({ state }))
    },
  },
)

export type AuthStore = typeof AuthStore.Type

export const initialState: typeof AuthStore.SnapshotType = {
  accessToken: null,
  state: "idle",
  loginError: null,
  effects: [],
}

export default AuthStore
