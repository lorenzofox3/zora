import { deepStrictEqual as eq } from "assert";
import {
  equal,
  fail,
  is,
  isNot,
  notEqual,
  notOk,
  ok,
  throws,
} from "../src/assert.js";

// equal
{
  eq(
    equal("foo", "foo", "a description"),
    {
      pass: true,
      actual: "foo",
      expected: "foo",
      description: "a description",
      operator: "equal",
    },
    "should returns an assert result (pass)"
  );

  eq(
    equal("foo", "bar"),
    {
      pass: false,
      actual: "foo",
      expected: "bar",
      description: "should be equivalent",
      operator: "equal",
    },
    "should returns an assert result (fail)"
  );
}

// notEqual
{
  eq(notEqual("foo", "bar"), {
    pass: true,
    actual: "foo",
    expected: "bar",
    description: "should not be equivalent",
    operator: "notEqual",
  });

  eq(notEqual("foo", "foo"), {
    pass: false,
    actual: "foo",
    expected: "foo",
    description: "should not be equivalent",
    operator: "notEqual",
  });
}

// is
{
  const instance = {};
  eq(is({ foo: "bar" }, { foo: "bar" }), {
    pass: false,
    actual: { foo: "bar" },
    expected: { foo: "bar" },
    description: "should be the same",
    operator: "is",
  });
  eq(is(instance, instance), {
    pass: true,
    actual: {},
    expected: {},
    description: "should be the same",
    operator: "is",
  });
}

// isNot
{
  const instance = {};
  eq(isNot({ foo: "bar" }, { foo: "bar" }), {
    pass: true,
    actual: { foo: "bar" },
    expected: { foo: "bar" },
    description: "should not be the same",
    operator: "isNot",
  });

  eq(isNot(instance, instance), {
    pass: false,
    actual: {},
    expected: {},
    description: "should not be the same",
    operator: "isNot",
  });
}

// ok
{
  eq(ok("truthy"), {
    pass: true,
    actual: "truthy",
    description: "should be truthy",
    expected: "truthy value",
    operator: "ok",
  });

  eq(ok(null), {
    pass: false,
    actual: null,
    expected: "truthy value",
    description: "should be truthy",
    operator: "ok",
  });
}

// notOK
{
  eq(notOk("truthy"), {
    pass: false,
    actual: "truthy",
    description: "should be falsy",
    expected: "falsy value",
    operator: "notOk",
  });

  eq(notOk(null), {
    pass: true,
    actual: null,
    expected: "falsy value",
    description: "should be falsy",
    operator: "notOk",
  });
}

// fail
{
  eq(fail("this should fail"), {
    pass: false,
    actual: "fail called",
    expected: "fail not called",
    description: "this should fail",
    operator: "fail",
  });
}

// throws
{
  const regexp = /^totally/i;

  class CustomError extends Error {
    constructor() {
      super("custom error");
    }
  }

  eq(
    throws(() => {
      throw new Error("Totally expected error");
    }, regexp),
    {
      pass: true,
      actual: "Totally expected error",
      expected: "/^totally/i",
      description: "should throw",
      operator: "throws",
    }
  );

  eq(
    throws(() => {
      throw new Error("not the expected error");
    }, regexp),
    {
      pass: false,
      actual: "not the expected error",
      expected: "/^totally/i",
      description: "should throw",
      operator: "throws",
    }
  );

  eq(
    throws(() => {
      throw new CustomError();
    }, CustomError),
    {
      pass: true,
      actual: CustomError,
      expected: CustomError,
      description: "should throw",
      operator: "throws",
    }
  );

  eq(
    throws(() => {
      throw new Error();
    }, CustomError),
    {
      pass: false,
      actual: Error,
      expected: CustomError,
      description: "should throw",
      operator: "throws",
    }
  );
}
