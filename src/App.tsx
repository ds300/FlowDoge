import glam from "glamorous-native"
import React from "react"
import AppStore, { bootstrap, create } from "./AppStore"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import { AppRegistry, ActivityIndicator } from "react-native"

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

  render() {
    return (
      <Container>
        {!this.app.auth.isIdle && <ActivityIndicator animating={true} />}
        {this.app.auth.isIdle &&
          this.app.auth.isLoggedIn &&
          <Info>Hooray you are logged in</Info>}
        {this.app.auth.isIdle &&
          !this.app.auth.isLoggedIn &&
          <Button>
            <ButtonLabel onPress={() => this.app.auth.logIn()}>
              Do a log in
            </ButtonLabel>
          </Button>}
      </Container>
    )
  }
}

AppRegistry.registerComponent("FlowDoge", () => App)

export default App

const Button = glam.touchableopacity({
  backgroundColor: "papayawhip",
  padding: 15,
})

const ButtonLabel = glam.text({
  color: "palevioletred",
})

const Info = glam.text({
  color: "#999",
  padding: 40,
})

const Container = glam.view({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
})
