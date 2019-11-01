# Piccy

## The app

The app is pretty simple, just a small pixelart editor, with limited capacity on purpose: 32x32 pixels, 16 fixed colors. The nice feature is that everything (colors, image data) are part of the url, with this format:

version: 1 char, `0` for now | size: 2 char, hexadecimal, `20` for now | color1: hexadecimal 6 chars, ie: `ff0000` |  color2 | ... | color16 |compressed image data `... Qai-llFZqXWFVIxIgFG7nnRe ...`

---

this data format is used for the editor:

https://piccy.site/edit/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA

---

and for image rendering:

https://piccy.site/img/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA

![](https://piccy.site/img/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA)

---

You also can add a scale before the data like this:

https://piccy.site/img/8/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA

![](https://piccy.site/img/8/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA)

---

By default, the server will output a `png` or a `webp` image, depending if your browser supports it or not.
you can force `png` ouput by adding `.png` a the end of the url.

## Local development

There are 2 components for the app:

1. The Editor, which is a [create-react-app](https://create-react-app.dev/) front end application.
2. The web server, which is an [Express](https://expressjs.com/) backend application. The server job is to serve the static files built for the editor, `/edit/` route and to render images on the `/img/` route.

### The editor

You will find the source files for the editor in the `packages/piccy-editor` folder. To start the app, just run `yarn start:editor` **at the root of the project**. The editor will launch your browser and display the editor, and each changes in the source will trigger a browser refresh (regular `create-react-app` behavior).
**You don't need the web server to work on the editor.**

### The web server

Server source files are located in `packages/piccy-server`. You can start the server with `yarn start:server`, in the root for the project. Because the server also serve the editor, the command build the editor first, then server is launched.
By default, server runs on the 3001 port so if everything is working correctly, going to `http://localhost:3001` should redirect you to `http://localhost:3001/editor/.....` and you should see the editor.

By going here `http://localhost:3001/img/12/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw1sCxR63-GtBLZUTdrtKdnMoW+KuhJFsATAMw3U1Vx0i111PDsP2wtftuAzuCGg2IQVREdms0LIl9ec3k1liw-OBI79B2gSj2DJB8YeUt5lsyp0bGZ1fL6daF9tLtTKBtf4ilMEhJGxOYNJB8OE+EXHqvBHh9GzRwGm6Tvr2mgr8Hl6OnunCCgJ6ida2zuWV1dWlZRn02UbaeUkcukyJRqxeLV2mXCKF8f4TYvEeaZ6u8PFcPqEobEA` you should see this:

![Welcome](https://piccy.site/img/6/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw1sCxR63-GtBLZUTdrtKdnMoW+KuhJFsATAMw3U1Vx0i111PDsP2wtftuAzuCGg2IQVREdms0LIl9ec3k1liw-OBI79B2gSj2DJB8YeUt5lsyp0bGZ1fL6daF9tLtTKBtf4ilMEhJGxOYNJB8OE+EXHqvBHh9GzRwGm6Tvr2mgr8Hl6OnunCCgJ6ida2zuWV1dWlZRn02UbaeUkcukyJRqxeLV2mXCKF8f4TYvEeaZ6u8PFcPqEobEA)

