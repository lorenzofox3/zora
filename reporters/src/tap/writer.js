import { defaultLogger, defaultSerializer, flatDiagnostic } from '../utils.js';

export const createWriter = ({
  log = defaultLogger,
  serialize = defaultSerializer,
  version = 13,
} = {}) => {
  const print = (message, padding = 0) => {
    log(message.padStart(message.length + padding * 4)); // 4 white space used as indent
  };

  const printYAML = (obj, padding = 0) => {
    const YAMLPadding = padding + 0.5;
    print('---', YAMLPadding);
    for (const [prop, value] of Object.entries(obj)) {
      print(`${prop}: ${serialize(value)}`, YAMLPadding + 0.5);
    }
    print('...', YAMLPadding);
  };

  const printComment = (comment, padding = 0) => {
    print(`# ${comment}`, padding);
  };

  const printBailOut = () => {
    print('Bail out! Unhandled error.');
  };

  const printTestStart = (newTestMessage) => {
    const {
      data: { description },
    } = newTestMessage;
    printComment(description);
  };

  const printAssertion = (assertionMessage, { id, comment = '' }) => {
    const { data } = assertionMessage;
    const { pass, description } = data;
    const label = pass === true ? 'ok' : 'not ok';
    const directiveComment = comment ? ` # ${comment}` : '';
    print(`${label} ${id} - ${description}` + directiveComment);
    if (pass === false) {
      printYAML(flatDiagnostic(data));
    }
  };

  const printSummary = ({ success, skip, failure, total }) => {
    print('', 0);
    print(`1..${total}`);
    printComment(`tests ${total}`, 0);
    printComment(`pass  ${success}`, 0);
    printComment(`fail  ${failure}`, 0);
    printComment(`skip  ${skip}`, 0);
  };

  const printHeader = () => {
    print(`TAP version ${version}`);
  };

  return {
    print,
    printYAML,
    printComment,
    printBailOut,
    printTestStart,
    printAssertion,
    printSummary,
    printHeader,
  };
};
