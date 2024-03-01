/*
 * @Author: twj
 * @Date: 2024-02-29 16:08:49
 * @LastEditTime: 2024-02-29 16:52:08
 * @LastEditors: twj
 * @Description:
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-essential",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "vue-eslint-parser", // 新增
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "vue"],
  rules: {
    "space-before-function-paren": 0,
    "vue/multi-word-component-names": "off",
    "no-unused-vars": "off", // 未使用变量
    "no-debugger": "off",
    eqeqeq: [2, "allow-null"],
    // "spaced-comment": 2, // 注释自动后面空两格
    "no-var": 2,
    // "vue/padding-line-between-blocks": "error", // 块之间要隔一行
  },
};
