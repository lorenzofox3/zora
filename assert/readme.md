# zora-assert

Assertion library used by zora projects

This library does not throw exception but returns [assertion results](#assertion-result) instead

Note: this package is not published 

## assertion API

```typescript
export interface ComparatorAssertionFunction {
    <T>(actual: unknown, expected: T, description?: string): AssertionResult<T>;
}

export interface BooleanAssertionFunction {
    (actual: unknown, description?: string): AssertionResult<boolean>;
}

export interface ErrorAssertionFunction {
    (
        fn: Function,
        expected: RegExp | Function,
        description?: string
    ): IAssertionResult<string | Function>;
    (fn: Function, description?: string): IAssertionResult<string>;
}

export interface MessageAssertionFunction {
    (message?: string): AssertionResult<string>;
}

interface Assert {
    equal: ComparatorAssertionFunction;

    // alias
    equals: ComparatorAssertionFunction;

    // alias
    eq: ComparatorAssertionFunction;

    // alias
    same: ComparatorAssertionFunction;

    // alias
    deepEqual: ComparatorAssertionFunction;

    notEqual: ComparatorAssertionFunction;

    // alias
    notEquals: ComparatorAssertionFunction;

    // alias
    notEq: ComparatorAssertionFunction;

    // alias
    notDeepEqual: ComparatorAssertionFunction;

    // alias
    notSame: ComparatorAssertionFunction;

    is: ComparatorAssertionFunction;

    isNot: ComparatorAssertionFunction;

    ok: BooleanAssertionFunction;

    // alias
    truthy: BooleanAssertionFunction;

    notOk: BooleanAssertionFunction;

    // alias
    falsy: BooleanAssertionFunction;

    fail: MessageAssertionFunction;

    throws: ErrorAssertionFunction;
}
```

## assertion result

```typescript
interface AssertionResult<T> {
    pass: boolean;
    actual: unknown;
    expected: T;
    description: string;
    operator: Operator;
    at?: string;
}
```

the ``at`` property is only there if the result has ``pass`` property set at ``false``

## onResult

You can pass a ``onResult`` callback function which the instance will call every time it produces a new assertion
result

```Javascript
import createAssert from 'zora-assert';

const assertions = [];
const onResult = (item) => assertions.push(item);

const assert = createAssert({onResult});

assert.ok('truthy');
assert.eq('foo', 'bar', 'some message');

/*
assertions > 
[
  {
    pass: true,
    actual: 'truthy',
    expected: 'truthy value',
    description: 'should be truthy',
    operator: 'ok'
  },
  {
    pass: false,
    actual: 'foo',
    expected: 'bar',
    description: 'some message',
    operator: 'equal',
    at: 'relevant/stacktrace/line'
  }
]
 */
```

## Assert prototype

The assert methods are bound to the instance, and you can destructure the instance to use the functions as if they were
regular functions

```javascript
import createAssert from 'zora-assert';

// destructure
const {ok, eq} = createAssert({collect});

ok('truthy');
eq('foo', 'bar', 'some message');
```

However, behind the scene, we use object delegation through the prototype chain so that you can enhance the Assert API
globally if you wish to.

```javascript
import createAssert, {Assert} from 'zora-assert';

// upgrade API
Assert.isFoo = (expected, description = 'should be foo') => {
    return {
        pass: expected === 'foo',
        expected,
        actual: 'foo',
        operator: 'isFoo',
        description
    };
};

// then use regularly
const {isFoo} = createAssert();

isFoo('bar') // failure
isFoo('foo') // success
```
