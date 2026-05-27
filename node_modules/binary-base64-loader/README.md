<div align="center">
  <img width="150" height="200"
    src="https://www.iconfinder.com/icons/298769/download/svg/512">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

# binary-base64-loader

A webpack loader that allows loading binary files as Base64 encoded strings.

Based on https://github.com/webpack-contrib/raw-loader

## Getting Started

Install `binary-base64-loader`:

```console
$ npm install binary-base64-loader --save-dev
```

After that you can load files with specific extensions using webpack config as usual, for example:

**webpack.config.js**

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.bin$/i,
        use: 'binary-base64-loader',
      },
    ],
  },
};
```

Then you can import the content of binary files with the given extension as Base64 encoded strings:

```js
import bigAsset from './asset.bin';
// bigAsset will equal to 'WW91IGp1c3QgbG9zdCBUSEUgR0FNRSE=...
```

Most probably though you will want to use the loader inline, without registering specific extensions in the webpack config. For example:

```js
import fontBinary from '!!binary-base64-loader!./funkyicons.ttf';
```

(The `!!` prefix is not obligatory but probably you will need it to remove other loaders from the chain which could apply based on the webpack config)

To make the inline use work under Typescript add this to a Typescript definition file in your project (`*.d.ts`, for example `shims-vue.d.ts`):

```typescript
declare module "!!binary-base64-loader!*" {
  const content: string;
  export default content;
}
```

## Options

|            Name             |    Type     | Default | Description            |
| :-------------------------: | :---------: | :-----: | :--------------------- |
| **[`esModule`](#esmodule)** | `{Boolean}` | `true`  | Uses ES modules syntax |

### `esModule`

Type: `Boolean`
Default: `true`

By default, `binary-base64-loader` generates JS modules that use the ES modules syntax.
There are some cases in which using ES modules is beneficial, like in the case of [module concatenation](https://webpack.js.org/plugins/module-concatenation-plugin/) and [tree shaking](https://webpack.js.org/guides/tree-shaking/).

You can enable a CommonJS module syntax using:

**webpack.config.js**

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.bin$/i,
        use: [
          {
            loader: 'binary-base64-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },
};
```

## License

[MIT](./LICENSE)
