import { types } from "mobx-state-tree"

export const Organization = types.model({})
export type Organization = typeof Organization.Type

export const FlowOrganization = types.model({
  id: types.number,
  name: types.string,
  parameterized_name: types.string,
  user_limit: types.number,
  user_count: types.number,
  active: types.boolean,
  url: types.string,
})
export type FlowOrganization = typeof FlowOrganization.Type

export const Flow = types.model({
  id: types.string,
  name: types.string,
  parameterized_name: types.string,
  organization: FlowOrganization,
  unread_mentions: types.number,
  open: types.boolean,
  joined: types.boolean,
  url: types.string,
  web_url: types.string,
  join_url: types.string,
  access_mode: types.string,
})

export type Flow = typeof Flow.Type

export const UserProfile = types.model({})
