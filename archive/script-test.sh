#!/bin/bash
#node check-node-version || exit 10
node test-task-serializer.js || exit 11
node demo-async-iter.js || exit 12
node demo-callbacks.js || exit 13
node demo-next-symbol.js || exit 14
node demo-wait-all.js || exit 15
node test-class-async-iter.js || exit 16

