# command-line-canvas

**Renders an array of shapes as ANSI art**

- Version: 0.0.1
- Created: 5th November 2025 by Rich Plastow
- Updated: 29rd November 2025 by Rich Plastow
- GitHub: <https://github.com/richplastow/command-line-canvas>
- Live demo: <https://richplastow.com/command-line-canvas/>

## What is it?

command-line-canvas is a JavaScript library for drawing text and shapes in the
terminal using ANSI escape codes. Great for creating complex (though blocky)
graphics for text-based UIs.

## Contributing

### Develop

```bash
npm install --global static-server
# added 1 package ...
static-server --version
# static-server 2.2.1
static-server --no-cache .
# ...
# * Serving files at: http://localhost:9080
# * Press Ctrl+C to shutdown.
```

Visit <http://localhost:9080/docs/> - there's no hot-reloading, so refresh the
browser manually to see changes.

> [!TIP]
> `static-server`'s `--no-cache` makes sure you're always loading up-to-date
> source files during development.

### Install and build

```bash
npm install --global rollup
# added 4 packages ...
rollup --version
# rollup v4.53.1
npm install
# Installs the "@types/node" dev-dependency
# ~3 MB  for ~140 items
npm run build
# any-3d-model-to-glb.js → docs/any-3d-model-to-glb.js...
# created docs/any-3d-model-to-glb.js in 32ms
# ✅ Build succeeded!
```

### Check types

```bash
npm install --global typescript
# added 1 package in 709ms
tsc --version
# Version 5.9.3
npm run check-types
# ✅ No type-errors found!
```

### Unit tests and end-to-end tests

```bash
npm test
# ...
# ✅ All tests passed!
```

### Preflight, before each commit

```bash
npm run ok
# ...runs tests, checks types, and rebuilds the bundle-file in docs/
# ...
# ✅ Build succeeded!
```

### Preview

```bash
static-server --no-cache docs
# ...
# * Serving files at: http://localhost:9080
# * Press Ctrl+C to shutdown.
```

Visit <http://localhost:9080/> (without 'docs/') to check the live demos work.
