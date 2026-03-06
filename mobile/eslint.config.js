// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
 {
  "extends": ["expo", "plugin:import/recommended"],
  "plugins": ["import"],
  "settings": {
    "import/resolver": {
      "babel-module": {}
    }
  }
}

]);
