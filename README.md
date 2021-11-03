# Dnd Map Editor
A DM helper for the famous game DnD (I'm not good with names).

[Check it out!](https://rossilorenzo.dev/dndme)

For any ideas, questions or if you want to help, please contact snowycoder on telegram.

## Deploy
This app uses peerjs with a public owned server to communicate so it just needs a static webserver to serve the files.

To generate the files use the following commands:
```bash
npm install
npx webpack --mode=production
```

Your files will be available in `dist`

## Development
If you are a developer and want live-reloading you can enable the webpack dev server:
```bash
npx webpack-dev-server --mode=development
```

For a more detailed description of the project internals check the Wiki, I'll try to maintain it up to date.
For any feature request and/or bug open an issue!
