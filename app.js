var promise = require('bluebird');
var fs = require('fs');

// promise.promisify(fn) 将方法promise化
var readFileAsync = promise.promisify(fs.readFile);

// promise.spread([fulfilledHandler],[rejectedHandler]); 将结果集拆分
promise.delay(0).then(function () {
    return [
        readFileAsync('./test1.txt', 'utf-8'),
        readFileAsync('./test2.txt', 'utf-8'),
        readFileAsync('./test3.txt', 'utf-8')
    ];
}).spread(function (f1, f2, f3) {
    console.log(f1, f2, f3);
});

// 在es6中可用解构赋值代替
promise.delay(500).then(function () {
    return [
        readFileAsync('./test1.txt', 'utf-8'),
        readFileAsync('./test2.txt', 'utf-8'),
        readFileAsync('./test3.txt', 'utf-8')
    ];
}).all().then(function ([f1, f2, f3]) {
    console.log(f1, f2, f3);
});

// finally() 与try...catch...finally类似
promise.delay(1000).then(function () {
    return [
        readFileAsync('./test1.txt', 'utf-8'),
        readFileAsync('./test2.txt', 'utf-8'),
        readFileAsync('/test5.txt', 'utf-8')
    ];
}).spread(function (f1, f2, f5) {
    console.log(f1, f2, f5);
}).catch(function (error) {
    // throw(error);
}).finally(function () {
    console.log('done');  // 在抛出错误后任会执行
});

// promise.join() 协调多个并发离散的promise
promise.join(
    readFileAsync('./test1.txt', 'utf-8'),
    readFileAsync('./test2.txt', 'utf-8'),
    readFileAsync('./test3.txt', 'utf-8'),
    function (f1, f2, f3) {
        return f1 + f2 + f3;
    }
).then(function (res) {
    console.log(res);
});

// 同步检测
var rf1 = readFileAsync('./test1.txt', 'utf-8');
var rf2 = readFileAsync('./test2.txt', 'utf-8');
var rf3 = readFileAsync('./test3.txt', 'utf-8');

promise.join(
    rf1, rf2, rf3,
    function (res1, res2, res3) {
        return res1 + res2 + res3;
    }
).then(function (res) {
    console.log(res);
}).finally(function () {
    console.log('fulfilled: ' + rf1.isFulfilled());         // isFulfilled() 检测是否完成
    console.log('rejected: ' + rf1.isRejected());           // isRejected() 检测是否失败
    console.log('cancelled: ' + rf1.isCancelled());         // isCancelled() 检测是否取消
    if (rf1.isFulfilled()) {
        console.log(rf1.value());   // 完成后的结果  value()
    }
    if (rf1.isRejected()) {
        console.log(rf1.reason());  // 失败的原因   reason()
    }
});

// promise.all() 将多个promise实例包装为1个promise实例 ,接受的参数为数组
var rf = [rf1, rf2, rf3];

promise.all(rf).spread(function (rf1, rf2, rf3) {   // 当状态都为fulfilled时，新的promise对象状态才为Fulfilled
    console.log('all: ' + rf1, rf2, rf3);
});


// promise.some()   参数1为数组,参数2可以指定返回最先改变状态的promise，回调函数的接受的参数同为数组
promise.some(rf, 2).spread(function (rf1, rf2) {
    console.log('some: ' + rf1, rf2);
});


// promise.props()   与promise.all()类似,参数为object,callback参数也同为对象
promise.props({
    rfProp1: rf1,
    rfProp2: rf2,
    rfProp3: rf3
}).then(function (res) {
    console.log('props: ' + JSON.stringify(res));
});


// promise.any()  参数为数组,最先改变状态的promise的值传递给callback

promise.any(rf).then(function (res) {
    console.log('any: ' + res);
});

// promise.race() 与promise.any()相同
promise.race(rf).then(function (res) {
    console.log('race: ' + res);
});


// promise.map()  参数为1个数组和回调函数

var files = ['./test1.txt', './test2.txt', './test3.txt'];
promise.map(files, function (file,index,length) {
    console.log(length,index);
    return readFileAsync(file);
}).then(function (res) {
    console.log('map: ' + res);
});

//可用于替代

var promises = [];
for (var i = 0, l = files.length; i < l; i++) {
    promises.push(readFileAsync(files[i], 'utf-8'));
}

promise.all(promises).spread(function (f1, f2, f3) {
    console.log(f1, f2, f3 + '-- map');
});

// promise.reduce(arr,callback,initValue)    与数组reduce类似 
promise.reduce(files,function(total,item,index,length){
    return readFileAsync(item,'utf-8').then(function(content){
        return total += content;
    });
},'').then(function(res){
    console.log('reduce: ' + res);
});


// promise.filter()  对promise进行筛选
// promise.each()  迭代数组或promise数组

var readdir = promise.promisify(fs.readdir);
var stat = promise.promisify(fs.stat);

readdir(process.cwd()).filter(function(filename){
    return stat(filename).then(function(stat){
        return stat.isDirectory();
    });
}).each(function(directoryName){
    console.log(directoryName);
});

