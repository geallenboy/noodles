# `standard`

> prettier，eslint，stylelint 的配置文件合集

## Usage

in `.eslintrc.js`

```js
module.exports = {
  extends: [require.resolve("@noodles/standard/dist/eslint")],

  rules: {
    // your rules
  },
};
```

in `.stylelintrc.js`

```js
module.exports = {
  extends: [require.resolve("@noodles/standard/dist/stylelint")],
  rules: {
    // your rules
  },
};
```

in `.prettierrc.js`

```js
const fabric = require("@noodles/standard");

module.exports = {
  ...fabric.prettier,
};
```
