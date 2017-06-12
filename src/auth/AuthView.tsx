import React from "react"
import { Animated } from "react-native"
import glam from "glamorous-native"
import { logo } from "../images"
import { Button } from "react-native-elements"
import * as colors from "../colors"

export default class AuthView extends React.Component<
  {
    loginFailed: boolean
    onSignIn(): void
  },
  {
    dogeRotation: Animated.Value
    dogeSize: Animated.Value
    opacity: Animated.Value
  }
> {
  state = {
    dogeRotation: new Animated.Value(0),
    dogeSize: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }
  componentDidMount() {
    Animated.spring(this.state.dogeRotation, {
      toValue: 1,
    }).start()
    Animated.spring(this.state.dogeSize, {
      toValue: 200,
    }).start()
    Animated.timing(this.state.opacity, {
      toValue: 1,
    }).start()
  }
  render() {
    const spin = this.state.dogeRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    })
    const logoStyle = {
      width: this.state.dogeSize,
      height: this.state.dogeSize,
      transform: [{ rotate: spin }],
    }
    return (
      <Container>
        <Centered>
          <LogoContainer>
            <Animated.Image source={logo} style={logoStyle} />
          </LogoContainer>
        </Centered>
        <Animated.View style={{ opacity: this.state.opacity }}>
          <Centered>
            <Title>FlowDoge</Title>
          </Centered>
          <Button
            title="Sign In"
            icon={{ name: "lock-open" }}
            iconRight
            raised
            backgroundColor={colors.primary}
            onPress={this.props.onSignIn}
          />
          {this.props.loginFailed && <Info>Couldn't log in. Try again.</Info>}
        </Animated.View>
      </Container>
    )
  }
}

const Container = glam.view({
  flex: 1,
  justifyContent: "center",
})
const Centered = glam.view({
  alignItems: "center",
})

const Title = glam.text({
  fontFamily: "Open Sans",
  fontSize: 50,
  fontWeight: "100",
  paddingVertical: 50,
})
const LogoContainer = glam.view({})
const Info = glam.text({})
