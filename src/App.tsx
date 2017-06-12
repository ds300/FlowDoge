import glam from "glamorous-native"
import React from "react"
import AppStore, { bootstrap, create } from "./AppStore"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import { AppRegistry, ActivityIndicator, View } from "react-native"
import AuthView from "./auth/AuthView"
import * as colors from "./colors"
import { SideMenu, List, ListItem } from "react-native-elements"

@observer
class App extends React.Component<{}, {}> {
  static childContextTypes = {
    app: PropTypes.any.isRequired,
  }

  app: AppStore

  componentWillMount() {
    this.app = create()
    bootstrap(this.app)
  }

  getChildContext() {
    return { app: this.app }
  }

  getBootstrapStage() {
    const currentEffect = this.app.user.currentBootstrapEffect
    if (currentEffect) {
      switch (currentEffect.type) {
        case "user_fetchCurrentUser":
          return "Fetching current user data"
        case "user_fetchAllUsers":
          return "Fetching all user data"
        case "user_fetchAllOrganizations":
          return "Fetching all organization data"
        case "user_fetchAllFlows":
          return "Fetching all flow data"
        case "user_fetchEnrolledFlows":
          return "Fetching your enrolled flow data"
        default:
          return "Please wait"
      }
    } else {
      return "error"
    }
  }

  render() {
    const users = this.app.user.users
      .entries()
      .slice(0, 5)
      .map(([id, user]) =>
        <ListItem
          roundAvatar
          onPress={() => console.log("Pressed")}
          avatar={user.avatar}
          key={id}
          title={user.name}
          subtitle={user.email}
        />,
      )

    const MenuComponent = (
      <View style={{ flex: 1, backgroundColor: "#ededed", paddingTop: 50 }}>
        <List containerStyle={{ marginBottom: 20 }}>
          {users}
        </List>
      </View>
    )

    if (this.app.auth.isLoggedIn || !this.app.auth.isIdle) {
      if (this.app.user.isReady) {
        return (
          <SideMenu isOpen={true} onChange={_ => {}} menu={MenuComponent}>
            <Container><Info>wow such flow</Info></Container>
          </SideMenu>
        )
      } else {
        return (
          <Container>
            <ActivityIndicator color={colors.primary} />
            <Info>
              {!this.app.auth.isIdle
                ? "Waiting for access token"
                : this.getBootstrapStage()}
            </Info>
          </Container>
        )
      }
    } else {
      return (
        <AuthView
          loginFailed={this.app.auth.loginFailed}
          onSignIn={this.app.auth.logIn}
        />
      )
    }
  }
}

AppRegistry.registerComponent("FlowDoge", () => App)

export default App

const Info = glam.text({
  color: "#999",
  padding: 40,
})

const Container = glam.view({
  flex: 1,
  backgroundColor: "white",
  alignItems: "center",
  justifyContent: "center",
})
