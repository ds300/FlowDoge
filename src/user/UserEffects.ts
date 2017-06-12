import { Effect } from "../utils"
import { types } from "mobx-state-tree"
import AppStore from "../AppStore"
import UserStore from "./UserStore"
import { log } from "../utils"

export const FetchCurrentUser = Effect("user_fetchCurrentUser")
export const FetchAllUsers = Effect("user_fetchAllUsers")
export const FetchAllOrganizations = Effect("user_fetchAllOrganizations")
export const FetchAllFlows = Effect("user_fetchAllFlows")
export const FetchEnrolledFlows = Effect("user_fetchEnrolledFlows")

export const UserEffect = types.union(
  FetchCurrentUser,
  FetchAllUsers,
  FetchAllOrganizations,
  FetchAllFlows,
  FetchEnrolledFlows,
)

export const userEffectHandlers = {
  [FetchCurrentUser.type]: function recur(
    _: any,
    userStore: UserStore,
    app: AppStore,
  ) {
    app
      .fetch("user")
      .then(user => {
        userStore.userProfileRetrieved(user as any)
      })
      .catch(err => {
        log.error(err)
      })
  },
  [FetchAllOrganizations.type](_: any, userStore: UserStore, app: AppStore) {
    app
      .fetch("organizations")
      .then(organizations => {
        userStore.organizationsRetrieved(organizations as any)
      })
      .catch(err => {
        log.error(err)
      })
  },
  [FetchAllFlows.type](_: any, userStore: UserStore, app: AppStore) {
    app
      .fetch("flows/all")
      .then(flows => {
        userStore.allFlowsRetrieved(flows as any)
      })
      .catch(err => {
        log.error(err)
      })
  },
}

export default userEffectHandlers
