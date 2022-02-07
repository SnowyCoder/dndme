# Dnd Map Editor
A DM helper for the famous game DnD (I'm not good with names).

[Check it out!](https://rossilorenzo.dev/dndme)

For any ideas, questions or if you want to help, please contact snowycoder on telegram.

## Deploy
This app uses public web-torrent trackers to discover its peers and WebRTC to send data so it just needs a static webserver to serve the files.

To generate the files use the following commands:
```bash
npm install
npx vite build
```

Your files will be available in `dist`

## Development
If you are a developer and want live-reloading you can use vite:
```bash
npm run dev
```

For a more detailed description of the project internals check the Wiki, I'll try to maintain it up to date.
For any feature request and/or bug open an issue!
