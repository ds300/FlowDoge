declare module "react-native-elements" {
  import RN from "react-native"
  import R from "react"

  export const Button: React.ComponentClass<
    RN.TouchableOpacityProperties & {
      title: string
      icon?: { name: string; size?: number }
      iconRight?: boolean
      raised?: boolean
      backgroundColor?: string
    }
  >

  export const SideMenu: React.ComponentClass<
    RN.TouchableOpacityProperties & {
      isOpen: boolean
      onChange(isOpen: boolean): void
      menu: JSX.Element
    }
  >
}
