# spread-the-word

> A Bonjour / Zeroconf implementation in JavaScript.

[![Github Version](https://img.shields.io/github/release/ardean/spread-the-word.svg)](https://github.com/ardean/spread-the-word)
[![NPM Version](https://img.shields.io/npm/v/spread-the-word.svg)](https://npmjs.org/package/spread-the-word)
[![NPM Downloads](https://img.shields.io/npm/dm/spread-the-word.svg)](https://npmjs.org/package/spread-the-word)
[![License](https://img.shields.io/npm/l/spread-the-word.svg)](LICENSE.md)

*Spread services across your local network and discover other services*

## Installation
```shell
npm i spread-the-word
```
or
```shell
yarn add spread-the-word
```

## Usage
```js
import stw from "spread-the-word";

stw
  .on("up", remoteService => console.log(`${remoteService.name} is up!`))
  .on("down", remoteService => console.log(`${remoteService.name} is down!`));

stw.listen({ type: "jsremote" });

stw.spread({
  type: "jsremote",
  name: "awesome remote receiver",
  port: 4444
});
```

## Features

- Easy service detection & advertisement on your local network
- [subtypes](https://tools.ietf.org/html/rfc6763#section-7.1) support 
- auto [probing](https://tools.ietf.org/html/rfc6762#section-8.1) on spread
- No extra native dependencies
- typescript types included

## Documentation

You can find the latest version of documentation hosted [here](https://ardean.github.io/spread-the-word/).

## License

[MIT](LICENSE.md)