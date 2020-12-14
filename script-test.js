'use strict';
var cp=require('child_process');
var {AsyncIter}=require('./index');

async function testone(cmd,aargs){
  return await new Promise((resolve,reject)=>{
    try{
      var child=cp.spawn(cmd,aargs,{stdio:'ignore'});
    }catch(e){
      reject(new Error(
        `[spawn fail] `+
        `${cmd},${JSON.stringify(aargs)}:: ${e.message}`));
    }
    child.on('error',(e)=>{
      reject(`${cmd},${JSON.stringify(aargs)}:: ${e.message}`);
    });
    child.on('close',(code,signal)=>{
      if (code||signal)
        reject(new Error(
          `${cmd},${JSON.stringify(aargs)}::FAIL ${code},${signal}`));
      resolve(`${cmd},${JSON.stringify(aargs)}::PASS ${code},${signal}`);
    });
  });
}

var progs=[
  "test-task-serializer.js",
  "demo-async-iter.js",
  "demo-callbacks.js",
  "demo-next-symbol.js",
  "demo-wait-all.js",
  "test-class-async-iter.js",
  "test-class-next-symbol.js",
];

async function main(){
  let ts=new AsyncIter();
  for (let prog of progs)
    ts.addTask(testone,'node',[prog]);
  ts.addEnd();
  for await(let iter of ts)
    console.log(iter);
}
main()
  .then(()=>{console.log("SUCCESS"); process.exitCode=0;})
  .catch((e)=>{console.log("FAIL: "+e.message); process.exitCode=0;});

