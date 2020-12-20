'use strict';

const {TaskSerializer}=require('./task-serializer.js');

class AsyncIter {
  constructor({concurrentTaskLimit=0}={}){
    if (Object.keys(arguments).includes('0'))
      concurrentTaskLimit=arguments['0'];
    this._sts=new TaskSerializer(concurrentTaskLimit);
    this._q=[];
    this._qe=[];
    this._nextpr={};
    this._reset_nextpr();
    this._emptyFlag=false;
    this._sts.onTaskResolved(((retval)=>{
      this._q.push(retval);
      this._nextpr.resolve();
    }).bind(this));
    this._sts.onTaskRejected(((e)=>{
      this._qe.push(e);
      this._nextpr.resolve();
    }).bind(this));
    this._sts.onEmpty((()=>{
      this._emptyFlag=true;
      this._nextpr.resolve();
    }).bind(this));
    this._asyncIterable=this._createAsyncIterable();
    //this._lnk_reset_nextpr=this._reset_nextpr.bind(this);
  }
  _reset_nextpr(){
    this._nextpr={};
    this._nextpr.promise=new Promise((r)=>{this._nextpr.resolve=r;});
  }
  addTask(func,...args){
    this._sts.addTask(func,...args);
  }
  addEnd(){
    this._sts.addEnd();
  }
  //getIterable(){return this[Symbol.asyncIterator]();}
  _createAsyncIterable(){
    let that=this;
    return {
      async next(){
        for (let iter=0;; iter++){
          // eslint-disable-next-line no-constant-condition
          if (that._qe.length) // errors have priority
            throw that._qe.splice(0,1)[0];
          if (that._q.length) // "normal" return
            return {done:false,value:that._q.splice(0,1)};
          // empty flag may be set before q,qe are drained so check this last
          // "empty" only means the sts member is empty, not ourself.
          if (that._emptyFlag)
            return {done:true};
          // we should wait here on promise until new data is ready
          if (iter>0)
            throw new Error(`asyncIterator.next, unexpected error iter==${iter}`);
          await that._nextpr.promise;
          that._reset_nextpr();  
        }
      }
    };
  }
  [Symbol.asyncIterator](){return this._asyncIterable; }
  next(){return this._asyncIterable.next();}
  // informationals
  getCountWaiting(){return this._sts.getWaitingCount();}
  getCountWorking(){return this._sts.getWorkingCount();}
  getCountResolvedNotRead(){return this._q.length;}
  getCountRejectedNotRead(){return this._qe.length;}
  getCountFinishedNotRead(){return this._q.length+this._qe.length;}
  // the following are monotonically increasing totals, 
  getCountResolvedTotal(){return this._sts.getResolvedCount();}
  getCountRejectedTotal(){return this._sts.getRejectedCount();}
  getCountFinishedTotal(){return this._sts.getFinishedCount();}
}

module.exports.AsyncIter=AsyncIter;
