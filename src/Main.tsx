import React from "react"
import AppStore from "./AppStore"
import { observer } from "mobx-react"
import PropTypes from "prop-types"
import { Button } from "react-native-elements"
import {
  DrawerNavigator,
  StackNavigator,
  TabNavigator,
  TabBarTop,
} from "react-navigation"
import { View } from "react-native"

function FlowView() {
  return <View><Button title="you are viewing a flow" /></View>
}
function ThreadView() {
  return <View><Button title="you are viewing a thread" /></View>
}
function DirectMessagesView() {
  return <View><Button title="you are viewing DMs" /></View>
}
function ActivityView() {
  return <View><Button title="you are viewing some activity" /></View>
}
function MentionsView() {
  return <View><Button title="you are viewing your mentions" /></View>
}
function DirectMessageActivityView() {
  return (
    <View><Button title="you are viewing your direct message activity" /></View>
  )
}

export const HomeView = TabNavigator(
  {
    Activity: { screen: ActivityView },
    Mentions: { screen: MentionsView },
    DirectMessageActivity: { screen: DirectMessageActivityView },
  },
  {
    tabBarComponent: TabBarTop,
    tabBarPosition: "top",
  },
)

export const MainView = StackNavigator({
  Home: { screen: HomeView },
  Flow: { screen: FlowView },
  Thread: { screen: ThreadView },
  DirectMessages: { screen: DirectMessagesView },
})

export const Menu = DrawerNavigator(
  {
    Main: { screen: MainView },
  },
  {},
)

export default Menu
