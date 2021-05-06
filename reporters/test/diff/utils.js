import { test } from "zora";
import { typeAsString } from "../../src/diff/utils.js";

test("utils", (t) => {
  t.test(`typeAsString`, (t) => {
    t.test(`literals`, (t) => {
      t.eq(typeAsString("some string"), "string");
      t.eq(typeAsString(42), "number");
      t.eq(typeAsString(true), "boolean");
      t.eq(typeAsString(undefined), "undefined");
    });

    t.test(`objects`, (t) => {
      t.eq(typeAsString({}), "Object");
      t.eq(typeAsString([]), "Array");
      t.eq(typeAsString(new Date()), "Date");
      t.eq(typeAsString(new Map()), "Map");
      t.eq(typeAsString(new Set()), "Set");
      t.eq(typeAsString(new (class Foo {})()), "Foo");
      t.eq(typeAsString(null), "null");
    });
  });
});
