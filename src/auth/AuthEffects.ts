import { types } from "mobx-state-tree"
import { Effect, log, unsecureRandomString } from "../utils"
import AuthStore from "./AuthStore"
import { join } from "path"
import * as qs from "query-string"
import { apiUrl, client_id, redirect_uri } from "../config"
import { Linking, AppState } from "react-native"

export const OpenBrowser = Effect("auth_OpenBrowser")
export type OpenBrowser = typeof OpenBrowser.Type

export const FetchToken = Effect("auth_FetchToken", {
  state: types.string,
})
export type FetchToken = typeof FetchToken.Type

export const AuthEffect = types.union(OpenBrowser, FetchToken)
export type AuthEffect = typeof AuthEffect.Type

export default {
  [FetchToken.type]({ props: { state } }: FetchToken, store: AuthStore) {
    fetch(
      join(apiUrl, "token") +
        "?" +
        qs.stringify({
          state,
        }),
    )
      .then(res => {
        if (res.status === 200) {
          res
            .json()
            .then(token => {
              store.tokenResultCompleted(token)
            })
            .catch(err => {
              log.info("token request was bad")
              log.error(err)
            })
        } else {
          log.error("token request failed", res.status, res.statusText)
        }
      })
      .catch(err => {
        log.info("token request failed")
        log.error(err)
      })
  },
  [OpenBrowser.type](_: any, store: AuthStore) {
    const state = unsecureRandomString(32)
    Linking.openURL(
      "https://api.flowdock.com/oauth/authorize?" +
        qs.stringify({
          client_id,
          response_type: "code",
          redirect_uri,
          state,
          scope: "flow private offline_access profile",
        }),
    )

    function appStateListener(appState: string) {
      if (appState === "active") {
        store.appRegainedFocusAfterFlowdockLogin(state)
        AppState.removeEventListener("change", appStateListener)
      }
    }
    AppState.addEventListener("change", appStateListener)
  },
}
