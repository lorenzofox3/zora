import {assertionMessage, bailout, endTestMessage, startTestMessage} from './protocol';
import {counter, delegateToCounter} from './counter';
import {Message} from './interfaces';

export const defaultTestOptions = Object.freeze({
    offset: 0,
    skip: false,
    runOnly: false
});

export const noop = () => {
};

export const TesterPrototype = {
    [Symbol.asyncIterator]: async function* () {
        await this.routine;
        for (const assertion of this.assertions) {
            if (assertion[Symbol.asyncIterator]) {
                // Sub test
                yield startTestMessage({description: assertion.description}, this.offset);
                yield* assertion;
                if (assertion.error !== null) {
                    // Bubble up the error and return
                    this.error = assertion.error;
                    this.pass = false;
                    return;
                }
            }
            yield assertionMessage(assertion, this.offset);
            this.pass = this.pass && assertion.pass;
            this.counter.update(assertion);
        }

        return this.error !== null ?
            yield bailout(this.error, this.offset) :
            yield endTestMessage(this, this.offset);
    }
};

export const testerLikeProvider = (BaseProto = TesterPrototype) => (assertions: Array<any>, routine: Promise<any>, offset: number) => {
    const testCounter = counter();
    const withTestCounter = delegateToCounter(testCounter);
    let pass = true;

    return withTestCounter(Object.create(BaseProto, {
        routine: {
            value: routine
        },
        assertions: {
            value: assertions
        },
        offset: {
            value: offset
        },
        counter: {
            value: testCounter
        },
        length: {
            get() {
                return assertions.length;
            }
        },
        pass: {
            enumerable: true,
            get() {
                return pass;
            },
            set(val) {
                pass = val;
            }
        }
    }));

};

export const testerFactory = testerLikeProvider();

export const map = fn => async function* (stream: AsyncIterable<Message<any>>) {
    for await (const m of stream) {
        yield fn(m);
    }
};