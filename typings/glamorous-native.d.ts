declare module "glamorous-native" {
  import RN from "react-native"
  import React from "react"

  export interface Props2StyleFunction<Styles, Props, ThemeProps> {
    (props: Props, themeProps?: ThemeProps): Styles
  }

  export type StyleArgs<Styles, Props, ThemeProps> = Array<
    Styles | Props2StyleFunction<Styles, Props, ThemeProps>
  >

  export interface StyledFunction<Props, Styles> {
    (style: Styles): React.ComponentClass<Props>
    <
      CustomProps,
      ThemeProps = {}
    >(style: Styles, props2style: Props2StyleFunction<
      Styles,
      CustomProps,
      ThemeProps
    >, ...more: StyleArgs<
      Styles,
      CustomProps,
      ThemeProps
    >): React.ComponentClass<Props>
  }

  export const view: StyledFunction<RN.ViewProperties, RN.ViewStyle>
  export const text: StyledFunction<RN.TextProperties, RN.TextStyle>
  export const touchableopacity: StyledFunction<
    RN.TouchableOpacityProperties,
    RN.ViewStyle
  >
}
