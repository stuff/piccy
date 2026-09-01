# Piccy

## The app

The app is pretty simple, just a small pixelart editor, with limited capacity on purpose: 32x32 pixels, 16 fixed colors. The nice feature is that everything (colors, image data) are part of the url.

Current format (`v1`) is a compact binary payload encoded as base64url (no padding):

- header: 1 byte (`version`, `size`, `palette mode`)
- palette: built-in palette id (default) or raw custom palette colors
- pixels: local color table + RLE/bit-packed pixel stream

The previous `v0` textual format is still supported for backward compatibility.

---

This data format is used for the editor:

https://piccy.stuffk.me/edit#0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA

---

And for image rendering:

https://piccy.stuffk.me/image/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA

![](https://piccy.stuffk.me/image/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA)

---

You also can add a scale before the data like this:

https://piccy.stuffk.me/image/8/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA

![](https://piccy.stuffk.me/image/8/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw18ZXTt-DFOS1b0c17PdoMbCF4mj7lA)

---

By default, the server will output a `png` or a `webp` image, depending if your browser supports it or not.
you can force `png` ouput by adding `.png` a the end of the url.

## Local development

The app is a single [Next.js](https://nextjs.org/) application at the root of the repository. It serves the editor on the `/edit` route and renders images on the `/image/` route (rewritten to an internal `/api/img/` route backed by [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) and [sharp](https://sharp.pixelplumbing.com/)).

Run `yarn dev` to start the dev server on port 3000. Changes in the source trigger a hot reload.

Going to `http://localhost:3000` should redirect you to `http://localhost:3000/edit` and display the editor. The image data lives in the URL hash, so editing gives you `http://localhost:3000/edit#.....`.

By going here `http://localhost:3000/image/12/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw1sCxR63-GtBLZUTdrtKdnMoW+KuhJFsATAMw3U1Vx0i111PDsP2wtftuAzuCGg2IQVREdms0LIl9ec3k1liw-OBI79B2gSj2DJB8YeUt5lsyp0bGZ1fL6daF9tLtTKBtf4ilMEhJGxOYNJB8OE+EXHqvBHh9GzRwGm6Tvr2mgr8Hl6OnunCCgJ6ida2zuWV1dWlZRn02UbaeUkcukyJRqxeLV2mXCKF8f4TYvEeaZ6u8PFcPqEobEA` you should see this:

![Welcome](https://piccy.stuffk.me/image/6/0201a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57Aw1sCxR63-GtBLZUTdrtKdnMoW+KuhJFsATAMw3U1Vx0i111PDsP2wtftuAzuCGg2IQVREdms0LIl9ec3k1liw-OBI79B2gSj2DJB8YeUt5lsyp0bGZ1fL6daF9tLtTKBtf4ilMEhJGxOYNJB8OE+EXHqvBHh9GzRwGm6Tvr2mgr8Hl6OnunCCgJ6ida2zuWV1dWlZRn02UbaeUkcukyJRqxeLV2mXCKF8f4TYvEeaZ6u8PFcPqEobEA)

### Other scripts

- `yarn build` — production build
- `yarn start` — serve the production build
- `yarn lint` — run ESLint
- `yarn typecheck` — run the TypeScript compiler with no emit

## Docker

The repository ships a multi-stage [`Dockerfile`](Dockerfile) that produces a
self-contained production image (no package manager, no `node_modules` install
at runtime) using Next.js' `output: 'standalone'` build.

```bash
docker build -t piccy .
docker run --rm -p 3000:3000 piccy
```

Or with Compose:

```bash
docker compose up --build
```

Then browse to `http://localhost:3000`.

The image is based on `node:22-alpine`. `@napi-rs/canvas` and `sharp` install a
prebuilt binary specific to the OS and libc, so the base is not a free choice —
it was measured against an otherwise identical `node:22-bookworm-slim` build,
hammering `/image/24/...`:

| base                            | image size | RSS after 900 renders | renders/sec @ 8 concurrent |
| ------------------------------- | ---------- | --------------------- | -------------------------- |
| `node:22-alpine` (musl)         | 247 MB     | ~90 MB                | ~27                        |
| `node:22-bookworm-slim` (glibc) | 323 MB     | ~210 MB               | ~38                        |

Alpine is smaller and roughly halves resident memory; glibc renders about 40%
faster. Neither leaks — both plateau. The trade is worth it for a low-traffic
demo, and would be worth revisiting under real load. Changing the base means
re-checking both native addons, since their musl and glibc builds differ.

Nothing in the app is stateful — every image lives in its URL — so the
container needs no volume and scales horizontally as-is. It listens on port
`3000`, runs as the unprivileged `node` user, and declares a `HEALTHCHECK` that
polls `/edit`.

### Deploying on Coolify

1. Create a new **Application** in Coolify and point it at this Git repository.
2. Set **Build Pack** to `Dockerfile` (the repository root `Dockerfile` is
   picked up automatically).
3. Set **Ports Exposes** to `3000`.
4. Add your domain under **Domains** — Coolify's proxy terminates TLS and
   forwards to the container, which is exactly the reverse-proxy setup Next.js
   recommends for self-hosting.
5. Deploy. No environment variables or persistent storage are required.

Coolify reuses the image's own `HEALTHCHECK`, so the container is only rotated
into the proxy once `/edit` answers.
