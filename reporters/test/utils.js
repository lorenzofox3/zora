import { test } from "zora";
import { defaultSerializer as stringify } from "../src/utils.js";

test(`serialize`, ({ test }) => {
  test("literals", ({ eq }) => {
    eq(stringify(4), "4");
    eq(stringify("foo"), '"foo"');
    eq(stringify(null), "null");
    eq(stringify(undefined), undefined);
  });

  test(`simple object`, ({ eq }) => {
    eq(stringify({ foo: "bar" }), `{"foo":"bar"}`);
  });

  test(`simple array`, ({ eq }) => {
    eq(stringify([{ foo: "bar" }, 4]), `[{"foo":"bar"},4]`);
  });

  test(`symbols`, ({ eq }) => {
    eq(stringify(Symbol("some symbol")), '"Symbol(some symbol)"');
    eq(
      stringify({ foo: Symbol("some symbol") }),
      '{"foo":"Symbol(some symbol)"}',
      "nested"
    );
  });
});
