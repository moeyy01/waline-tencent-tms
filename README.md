# @waline-plugins/tencent-tms

A Waline plugin that add tencent cloud TMS audit service for Waline when post a new comment.

## How to Install

```
npm i moeyy-waline-tencent-tms
```

## How to Use

```js
// index.js
const Waline = require('@waline/vercel');
const TencentTMS = require('moeyy-waline-tencent-tms');

module.exports = Waline({
  plugins: [
    TencentTMS({
      secretId: 'xxx',
      secretKey: 'xxx',
      region: 'ap-beijing',
    })
  ]
});
```