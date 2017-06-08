import { types, IType } from "mobx-state-tree"
import Expo from "expo"
import qs from "query-string"
import { stringEnum, Effect, log } from "../utils"
import { client_id, redirect_uri, apiUrl } from "../config"
import { join } from "path"
import cryptoRandom from "crypto-random-string"

const State = stringEnum("idle", "awaiting_code", "awaiting_token")
type State = keyof typeof State

const OAuthResult = types.model("auth_OAuthResult", {
  access_token: types.string,
  refresh_token: types.string,
  expires_in: types.number,
  token_type: types.string,
})

type OAuthResult = typeof OAuthResult.Type

const OpenBrowser = Effect("auth_OpenBrowser")

const AuthEffect = types.union(OpenBrowser, OpenBrowser)
type AuthEffect = typeof AuthEffect.Type

const AuthStore = types.model(
  "AuthStore",
  {
    oauthResult: types.maybe(OAuthResult),
    state: types.optional(types.string as IType<State, State>, "idle"),
    loginError: types.maybe(types.string),
    effects: types.array(AuthEffect),
    get isLoggedIn() {
      return !!this.oauthResult
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
      this.effects.push(OpenBrowser.create({ type: "auth_OpenBrowser" }))
    },

    /**
     * @param description an error message to display
     */
    logInErrorEncountered(description: string) {
      this.loginError = description
      this.state = State.idle
    },

    tokenResultCompleted(result: OAuthResult) {
      this.oauthResult = result
      this.state = State.idle
    },
  },
)

type AuthStore = typeof AuthStore.Type

export const initialState: typeof AuthStore.SnapshotType = {
  oauthResult: null,
  state: "idle",
  loginError: null,
  effects: [],
}

export const effectHandlers = {
  [OpenBrowser.type](_: any, store: AuthStore) {
    const state = cryptoRandom(32)
    Expo.WebBrowser.openBrowserAsync(
      "https://api.flowdock.com/oauth/authorize?" +
        qs.stringify({
          client_id,
          response_type: "code",
          redirect_uri,
          state,
          scope: "flow private offline_access profile",
        }),
    )
    fetch(
      join(apiUrl, "token") +
        "?" +
        qs.stringify({
          state,
        }),
    )
      .then(res => res.json())
      .then(token => {
        store.tokenResultCompleted(token)
      })
  },
}

export default AuthStore
