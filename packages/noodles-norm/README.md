# `noodles-norm`

> TODO: description
# noodels-norm

一个包含 prettier，eslint，stylelint 的配置文件合集

# 使用

`.eslintrc.js`

```js
module.exports = {
    extends: [require.resolve('noodles-norm/dist/eslint')],
    rules: {
        // your rules
    },
}

```

`.stylelintrc.js`

```js
module.exports = {
    extends: [require.resolve('noodles-norm/dist/stylelint')],
    rules: {
        // your rules
    },
}

```

`.prettierrc.js`

```js
module.exports = {
    ...fabric.prettier,
}

```