import { types, clone } from "mobx-state-tree"
import { UserEffect } from "./UserEffects"
import * as Eff from "./UserEffects"

export const User = types.model("User", {
  id: types.number,
  email: types.string,
  name: types.string,
  nick: types.string,
  avatar: types.string,
  website: types.maybe(types.string),
})
export type User = typeof User.Type

export const Organization = types.model("Organization", {
  id: types.number,
  name: types.string,
  parameterized_name: types.string,
  user_limit: types.number,
  user_count: types.number,
  active: types.boolean,
  url: types.string,
  users: types.array(User),
})
export type Organization = typeof Organization.Type

export const Flow = types.model("Flow", {
  id: types.string,
  name: types.string,
  parameterized_name: types.string,
  organization: types.model("OrganizationId", { id: types.number }),
  unread_mentions: types.maybe(types.number),
  open: types.boolean,
  joined: types.boolean,
  access_mode: types.string,
})

export type Flow = typeof Flow.Type

export const UserStore = types.model(
  "UserStore",
  {
    profile: types.union(User, types.literal(null)),
    profileLastFetched: types.number,
    flows: types.map(Flow),
    flowsLastFetched: types.number,
    organizations: types.map(Organization),
    organizationsLastFetched: types.number,
    users: types.map(User),
    effects: types.array(UserEffect),
    enqueuedBootstrapEffects: types.array(UserEffect),
    currentBootstrapEffect: types.maybe(UserEffect),
    get isReady() {
      return (
        this.profile &&
        !this.enqueuedBootstrapEffects.length &&
        !this.currentBootstrapEffect
      )
    },
  },
  {
    loggedIn() {
      this.enqueuedBootstrapEffects.push(
        Eff.FetchCurrentUser.create(),
        Eff.FetchAllOrganizations.create(),
        Eff.FetchAllFlows.create(),
      )
      this.continueBootstrapSequence()
    },
    continueBootstrapSequence() {
      const eff = this.enqueuedBootstrapEffects.shift()
      if (eff) {
        this.effects.push(clone(eff))
        this.currentBootstrapEffect = clone(eff)
      } else {
        this.currentBootstrapEffect = null
      }
    },
    usersRetrieved(userList: User[]) {
      userList.forEach(user => {
        this.users.set(user.id.toString(), user)
      })
    },
    organizationsRetrieved(
      organizationList: Array<typeof Organization.SnapshotType>,
    ) {
      const organizationMap: {
        [key: string]: typeof Organization.SnapshotType
      } = {}
      organizationList.forEach(organization => {
        this.usersRetrieved(organization.users)
        organizationMap[organization.id] = organization
      })
      this.organizations = organizationMap as any
      this.continueBootstrapSequence()
    },
    allFlowsRetrieved(flowsList: Array<typeof Flow.SnapshotType>) {
      const flowMap: { [key: string]: typeof Flow.SnapshotType } = {}
      flowsList.forEach(flow => {
        flowMap[flow.id] = flow
      })
      this.flows = flowMap as any
      this.continueBootstrapSequence()
    },
    userProfileRetrieved(user: User) {
      this.profile = User.create(user)
      this.continueBootstrapSequence()
    },
  },
)

export type UserStore = typeof UserStore.Type

export const initialState: typeof UserStore.SnapshotType = {
  profile: null,
  profileLastFetched: 0,
  flows: {},
  flowsLastFetched: 0,
  organizations: {},
  organizationsLastFetched: 0,
  users: {},
  effects: [],
  currentBootstrapEffect: null,
  enqueuedBootstrapEffects: [],
}

export default UserStore
