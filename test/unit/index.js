// hack to avoid the autostart of zora;
const {createHarness} = require('../../dist/bundle/index.js');
createHarness();

require('./assertion');
require('./test');
