/** @type {import("eslint").Linter.Config} */
const config = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    "prefer-const": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "off"
  }
}

module.exports = config