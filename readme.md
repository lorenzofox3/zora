# Zora

**The next version (v5) in beta of the zora testing library, its test runner (pta), etc.**

If you wish to read the documentation for v4, please refer to the [v4 branch](https://github.com/lorenzofox3/zora/tree/v4)

All the projects related to [zora](./zora), the testing library

* [zora](./zora): the testing library
* [zora-assert](./assert): the assertion library behind zora(unpublished)
* [zora-reporters](./reporters): a set of reporters (can be used as a CLI)
* [pta](./pta): A test runner (used with a Command Line Interface) for Nodejs environment

The repo also comes with
* [a pseudo benchmark](./perfs) which shows the testing experience with various testing framework
* [a list of recipes](./examples) to get started with different environments (node, browser, typescript, etc)

## Goals

Zora is one of the lightest (if not the lightest), yet one of the fastest Javascript testing library (if not the fastest).

Its design principles follow the line:

* Runs with any Javascript environment ([Nodejs](https://nodejs.org/en/), [Deno](https://deno.land/), Browser ): you don't need any specific test runner to run your testing program, it is _just_ a regular javascript program
* Is fast and simple: a [small codebase](https://packagephobia.com/result?p=zora) achieving the [best performances](./perfs) to deliver the best developer experience
* Follows the [UNIX philosophy](https://en.wikipedia.org/wiki/Unix_philosophy): a set of focused, composable small software to deliver the best flexibility with the minimum overhead, rather than a huge monolith hard to tweak, with a large set options.
