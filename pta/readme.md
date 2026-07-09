# PTA

Test runner for any zora testing program, using node (version >= 22.18.0).

## Installation

``npm i -g pta``

## Usage

example:

``pta test/**/*.js``

Note: it should work with both module format commonjs and ES

`.ts`/`.mts`/`.cts` test files are discovered and run directly via Node's
native type stripping — no extra tooling (`ts-node`, `tsx`, ...) required.
Only erasable TypeScript syntax is supported (type annotations, interfaces,
type-only imports); enums, namespaces and parameter properties need Node's
`--experimental-transform-types` flag (e.g. via `NODE_OPTIONS`) to load.

## Options

```
Usage
    pta [<file> ...]

  Options
    --only             Runs zora in "only mode"

    --reporter, -R          One of tap, log. Otherwise it will use the default reporter


  Examples
    pta
    pta test/{unit,int}/**/*.js

  If no argument is provided, the CLI will use the following patterns:
    - **/test.{js,cjs,mjs,ts,mts,cts}
    - **/*.spec.{js,cjs,mjs,ts,mts,cts}
    - **/*.test.{js,cjs,mjs,ts,mts,cts}
    - **/test/**/*.{js,cjs,mjs,ts,mts,cts}
    - **/tests/**/*.{js,cjs,mjs,ts,mts,cts}
    - **/__tests__/**/*.{js,cjs,mjs,ts,mts,cts}
```

