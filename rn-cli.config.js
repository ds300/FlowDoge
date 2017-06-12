module.exports = {
  getTransformModulePath() {
    return require.resolve("react-native-typescript-transformer")
  },
  getAssetExts() {
    return ["ttf"]
  },
  getSourceExts() {
    return ["ts", "tsx"]
  },
}
