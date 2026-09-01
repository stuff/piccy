[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=stuff/piccy)](https://dependabot.com)

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

The app is a single [Next.js](https://nextjs.org/) application at the root of the repository. It serves the editor on the `/edit/` route and renders images on the `/img/` route (an API route backed by [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) and [sharp](https://sharp.pixelplumbing.com/)).

Run `yarn dev` to start the dev server on port 3000. Changes in the source trigger a hot reload.

Going to `http://localhost:3000` should redirect you to `http://localhost:3000/edit/.....` and display the editor.

By going here `http://localhost:3000/img/12/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw1sCxR63-GtBLZUTdrtKdnMoW+KuhJFsATAMw3U1Vx0i111PDsP2wtftuAzuCGg2IQVREdms0LIl9ec3k1liw-OBI79B2gSj2DJB8YeUt5lsyp0bGZ1fL6daF9tLtTKBtf4ilMEhJGxOYNJB8OE+EXHqvBHh9GzRwGm6Tvr2mgr8Hl6OnunCCgJ6ida2zuWV1dWlZRn02UbaeUkcukyJRqxeLV2mXCKF8f4TYvEeaZ6u8PFcPqEobEA` you should see this:

![Welcome](https://piccy.site/img/6/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw1sCxR63-GtBLZUTdrtKdnMoW+KuhJFsATAMw3U1Vx0i111PDsP2wtftuAzuCGg2IQVREdms0LIl9ec3k1liw-OBI79B2gSj2DJB8YeUt5lsyp0bGZ1fL6daF9tLtTKBtf4ilMEhJGxOYNJB8OE+EXHqvBHh9GzRwGm6Tvr2mgr8Hl6OnunCCgJ6ida2zuWV1dWlZRn02UbaeUkcukyJRqxeLV2mXCKF8f4TYvEeaZ6u8PFcPqEobEA)

### Other scripts

- `yarn build` — production build
- `yarn start` — serve the production build
- `yarn lint` — run ESLint
- `yarn typecheck` — run the TypeScript compiler with no emit
