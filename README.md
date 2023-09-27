# ![](.media/icon.png) Draw & Dice Map Editor

Peer-to-peer multiplayer virtual tabletop for roleplaying games

## Links

[![Website](https://img.shields.io/website?url=https%3A%2F%2Frossilorenzo.dev%2Fdndme)](https://rossilorenzo.dev/dndme)
 
[![Signaling](https://img.shields.io/website?url=https%3A%2F%2Fsignaling.dndme.rossilorenzo.dev&label=signaling)](https://signaling.dndme.rossilorenzo.dev/)

[![Documentation](https://img.shields.io/badge/documentation-wiki-blue?logo=github)](https://github.com/SnowyCoder/dndme/wiki)
 
[![Telegram chat](https://img.shields.io/badge/telegram-chat-blue?logo=telegram)](https://t.me/mytikas_party)

## Screenshots

> [!WARNING]
>
> Missing screenshots.

<!--
<details>
<summary>Alt text</summary>

![Alt text](.media/screenshot-N.png)

</details>
-->

## Architecture

This application is a static web page; therefore, it doesn't need any separate server to run!

Player detection is done via [a small centralized signaling server written in Rust](signaling/) currently hosted at `wss://signaling.dndme.rossilorenzo.dev/`.

Networking between players is done via [WebRTC].

[WebRTC]: https://webrtc.org/

## Build

### Client

To generate the files necessary to run the production client:

1. Install the [Node.JS] dependencies with [npm]:
	```console
	$ npm install
	```

2. Using [npx] and [Vite], build the [Vue] source files:
	```console
	$ npx vite build
	```

Built files will be placed in `dist/`.

### Signaling server

To build the executable for the production signaling server:

1. Use [Cargo] to build the [Rust] source files:
	```console
	$ cargo build --release
	```

Built files will be placed in `target/release/`.

## Deployment

### Client

Client deployment is performed automatically via [GitHub Pages] on every commit to `main`.

### Signaling server

> [!WARNING]
> 
> Missing documentation.

## Development

### Client

To run a live-reloading version of the client:

1. Install the [Node.JS] development dependencies with [npm]:
	```console
	$ npm install --dev
	```

2. Run the `dev` script:
	```console
	$ npm run-script dev
	```

### Signaling server

> [!WARNING]
> 
> Missing documentation.


[Node.JS]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[npx]: https://docs.npmjs.com/cli/v7/commands/npx
[Vite]: https://vitejs.dev/
[Vue]: https://vuejs.org/
[Cargo]: https://doc.rust-lang.org/cargo/
[Rust]: https://www.rust-lang.org/
[GitHub Pages]: https://pages.github.com/