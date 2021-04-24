import { test, skip } from "zora";

test("hello world", (t) => {
  t.ok(true);
  t.skip("blah", (t) => {
    t.ok(false);
  });
  t.skip("for some reason");
});

skip("failing text", (t) => {
  t.ok(false);
});
