# zora-reporters

A set of reporters to programmatically (or via a CLI) consume a stream made of the zora testing protocol.

## installation

``npm i zora-reporters``

## zora testing protocol messages

```typescript
interface INewTestMessageInput {
  description: string;
  skip: boolean;
}

interface ITestEndMessageInput {
  description: string;
  executionTime: number;
}

interface IMessage<T> {
  type: string;
  data: T;
}

interface INewTestMessage extends IMessage<INewTestMessageInput> {
  type: 'TEST_START';
}

interface IAssertionMessage extends IMessage<IAssertionResult<unknown>> {
  type: 'ASSERTION';
}

interface ITestEndMessage extends IMessage<ITestEndMessageInput> {
  type: 'TEST_END';
}
```

## usage

### programmatically

// todo

### CLI 

// todo

## reporters

### Log (JSON)

// todo

### TAP (Test Anything Protocol)

// todo

### Diff

// todo

