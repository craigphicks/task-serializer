'use strict';
// eslint-disable-next-line @typescript-eslint/no-var-requires
var {AsyncIter /*NextSymbol*/} = require('../dist/index.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
var {task /*makepr,snooze*/} = require('./demo-lib.js');
async function testAsyncIter() {
  let ts = new AsyncIter();
  ts.addTask(task, 0, 11, false);
  ts.addTask(task, 1, 10, false);
  ts.addTask(task, 2, 10, true);
  ts.addTask(task, 3, 10, true);
  ts.addEnd();
  let r = [];
  r.push(await ts.next().catch((e) => e.message));
  r.push(await ts.next().catch((e) => e.message));
  r.push(await ts.next().catch((e) => e.message));
  r.push(await ts.next().catch((e) => e.message));
  console.log(JSON.stringify(r, 0, 2));
}
testAsyncIter()
  .then(() => {
    console.log('success');
    process.exitCode = 0;
  })
  .catch((e) => {
    console.log('failure: ' + e.message);
    process.exitCode = 1;
  });
