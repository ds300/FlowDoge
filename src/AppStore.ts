import AuthStore, { initialState as authInitialState } from "./auth/AuthStore"
import UserStore, { initialState as userInitialState } from "./user/UserStore"
import authEffectHandlers from "./auth/AuthEffects"
import userEffectHandlers from "./user/UserEffects"
import { types } from "mobx-state-tree"
import { runEffects, log, reportCriticalError } from "./utils"
import { when } from "mobx"

const initialState = {
  auth: authInitialState,
  user: userInitialState,
}

export const AppStore = types.model(
  {
    auth: AuthStore,
    user: UserStore,
  },
  {
    fetch(path: string, options: RequestInit = {}) {
      const url = `https://api.flowdock.com/${path}`
      const accessToken = this.auth.accessToken
      const headers = accessToken
        ? Object.assign(
            {
              Authorization: "Bearer " + accessToken.access_token,
              Accept: "application/json",
            },
            options.headers,
          )
        : {}
      return new Promise((resolve, reject) => {
        const retryPeriods = [2, 3, 5, 8, 13]

        function attemptFetch() {
          fetch(url, Object.assign({}, options, { headers }))
            .then(res => {
              if (res.status === 200) {
                res
                  .json()
                  .then(json => {
                    try {
                      resolve(json)
                    } catch (e) {
                      log.error(e)
                      reportCriticalError(e)
                    }
                  })
                  .catch(err => {
                    log.error(err)
                    reject(err)
                  })
              } else if (res.status < 500) {
                log.error("bad http status", res.status, res.statusText)
                reject({
                  reason: `http result ${res.status} ${res.statusText}`,
                })
              } else {
                if (retryPeriods.length) {
                  setTimeout(
                    attemptFetch,
                    (retryPeriods.shift() as number) * 1000,
                  )
                } else {
                  reject({ reason: "timeout" })
                }
              }
            })
            .catch(err => {
              log.error(err)
              reject(err)
            })
        }

        attemptFetch()
      })
    },
  },
)

export type AppStore = typeof AppStore.Type

export default AppStore

export function create() {
  return AppStore.create(initialState)
}

export function bootstrap(store: AppStore) {
  runEffects(store, store.auth, authEffectHandlers)
  runEffects(store, store.user, userEffectHandlers)
  when(
    () => store.auth.isLoggedIn,
    () => {
      store.user.loggedIn()
    },
  )
}
