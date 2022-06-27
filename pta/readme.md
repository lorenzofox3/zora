# PTA

Test runner for any zora testing program, using node (version >= 16).

## Installation

``npm i -g pta``

## Usage

example:

``pta test/**/*.js``

Note: it should work with both module format commonjs and ES

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
    - **/test.js
    - **/*.spec.js
    - **/*.test.js
    - **/test/**/*.js
    - **/tests/**/*.js
    - **/__tests__/**/*.js
```

