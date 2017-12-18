---
title: Redux-Middleware 概念思路理解
comments: true
date: 2016-07-17 23:02:17
updated: 2016-07-17 23:02:17
categories:
tags:
---
## 原因

中间件这个概念实际上真的不复杂

## 关于Middleware

> 在例如 `Express` 或者 `Koa` 框架中，`middleware` 是指可以被嵌入在框架**接收请求到
产生响应过程之中的代码**例如，`Express` 或者 `Koa` 的 `middleware` 可以完
成添加 `CORS headers`、记录日志、内容压缩等工作。`middleware` 最优秀的
特性就是可以被链式组合。

可以理解, `middleware` 形式如下图:

![middleware001](/images/middleware001.jpg)

主要用途: 
- 异步的`action`
- `action`过滤
- 日志输出
- 异常报告


## 一个典型的Rudex-Middleware


这是一个用于日志输出的典型中间件:
```javascript
//                              ↓↓这里的next实质是一个Dispatch函数
const logger1 = ({getState}) => (next) => (action) => {
    console.log('[logger1]:dispatching', action);
    let result = next(action);
    console.log('[logger1]:next state = ', getState());
    return result;
};
```
其实这一大串很容易理解:
- `logger1`是一个中间件, 它接收一个"类"`store`对象, 这个对象必须有函数成员`getState()`.
- `logger1`这个中间件返回的是一个函数, 这个函数的功能就是修饰`Dispatch`
- `logger1(store)`是一个关于`store`的用来修饰`Dispatch`函数的**修饰器**.(或者也可以说是一个加工函数的加工厂)

上面用图解释就是:
![middleware002](/images/middleware002.jpg)

也就是说, `Middleware`首先要绑定一个`store`, 这个`store`需要和它对应的`Dispatch`函数相关联, 然后`middleware(store)`则是一个修饰器, 将`Dispatch`根据自己应该实现的功能给包装起来, 返回一个新的`Dispatch`函数.

## Redux-Middleware的用法
以一个加减法示例来说明:

### actions.js
```javascript
export const actionTypes = {
    ADD: 'ADD',
    SUB: 'SUB'
};

export const actionCreator = {
    addNum: (num) => ({
        type: actionTypes.ADD,
        num
    }),
    subNum: (num) => ({
        type: actionTypes.SUB,
        num
    })
};
```

### reducers.js
```javascript
import {actionTypes} from './actions.js';

export default (state = { value: 0 }, action) => {
    switch (action.type) {
        case actionTypes.ADD:
            return Object.assign({}, state, {
                value: state.value + action.num
            });
        case actionTypes.SUB:
            return Object.assign({}, state, {
                value: state.value - action.num
            });
        default:
            return state;
    }
};
```

### middleware.js
```javascript
export const logger1 = ({getState}) => (next) => (action) => {
    console.log('[来自logger1]:发送了action:', action);
    let result = next(action);
    console.log('[来自logger1]:发送了action:', getState());
    return result;
};

export const logger2 = ({getState}) => (next) => (action) => {
    console.log('[来自logger2]:发送了action:', action);
    try {
        var result = next(action);
    } catch (error) {
        console.log('[来自logger2]:捕获到了一个错误: ', error);
    }
    console.log('[来自logger2]:发送了action:', getState());
    return result;
};
```

### index.js
```javascript
import {createStore} from 'redux';
import reducers from './reducers.js';
import {actionTypes, actionCreator} from './actions.js';
import {logger1, logger2} from './middleware.js';

function applyMiddleware(...middlewares) {
    return (createStore) => (reducer, preloadedState, enhancer) => {
        let store = createStore(reducer, preloadedState, enhancer);
        let dispatch = store.dispatch;
        let middlewareAPI = {
            getState: store.getState,
            dispatch: (action) => dispatch(action)
        };

        // chain 中保存的是 绑定了store的中间件        
        let chain = middlewares.map((middleware) => middleware(middlewareAPI));


        // 将原始的dispatch 一层一层封装起来, 即依次通过绑定了store的中间件
        //         ↓↓↓ 注意这个compose函数        
        dispatch = compose(...chain)(store.dispatch);
        
        return Object.assign({}, store, { dispatch });
    };
}


// applyMiddleware 接收一个"中间件"数组, 返回的是一个用来修饰createStore的函数
// 所以, 这个applyMiddleware可以这样用
let createStoreModifyer = applyMiddleware(logger1, logger2);
// applyMiddleware([logger1,logger2])是一个函数,
// 它接收一个 天然的 createStore 函数, 这个 createStore 来自 redux,
// 返回的是一个经过中间件修饰过的 createStore 函数
let storeWithLogger = createStoreModifyer(createStore)(reducers);


console.log('------------------------------------------');
storeWithLogger.dispatch(actionCreator.addNum(3));
console.log('------------------------------------------');
storeWithLogger.dispatch(actionCreator.subNum(5));
console.log('------------------------------------------');

/** 输出结果:
------------------------------------------ 
[来自logger1]:发送了action: { type: 'ADD', num: 3 }
[来自logger2]:发送了action: { type: 'ADD', num: 3 }
[来自logger2]:发送了action: { value: 3 }
[来自logger1]:发送了action: { value: 3 }
------------------------------------------
[来自logger1]:发送了action: { type: 'SUB', num: 5 }
[来自logger2]:发送了action: { type: 'SUB', num: 5 }
[来自logger2]:发送了action: { value: -2 }
[来自logger1]:发送了action: { value: -2 }
------------------------------------------ 
 */
 ```

 同样, 注意到在`applyMiddleware()`函数中有一个`compose()`函数, 它原来的实现是这样的
 ```js
 function compose(...funcs) {
    if (funcs.length === 0) {
        return arg => arg
    }
    if (funcs.length === 1) {
        return funcs[0]
    }
    const last = funcs[funcs.length - 1]; // 最后一个函数, last是最后一个中间件
    const rest = funcs.slice(0, -1); // rest数组保存了除了最后一个函数的之前函数
    return (...args) => rest.reduceRight((composed, f) => f(composed), last(...args))
    /**
     * 返回了一个函数, 这个函数接收一个数组参数arg[]
     * 以last(...args)作为初值, 从右边向左边reduce
     * 实际上, 这个args是最原始的dispatch函数
     */
}
 ```
一看过去, 烦, 繁! 于是我简化了一下
```js
function myCompose(...bindedMiddlewares) {
    return (dispatch) => {
        let modifierArray = [...bindedMiddlewares, dispatch];

        // 返回的是经过一层一层全部封装好的dispatch函数
        return modifierArray.reduceRight((modifiedDispatch, bindedMiddleware) => {
            return bindedMiddleware(modifiedDispatch);
        });
    };
}
```

## 解释

中间件实质就是在玩函数加工游戏!!!

中间件实质就是在玩函数加工游戏!!!

中间件实质就是在玩函数加工游戏!!!

`applyMiddleware()`接收一个`createStore()`和中间件数组, 返回一个通过所有中间件的全新`createStore()`.其实, 我是通过字面意思理解, 因为这和`Function.prototype.apply()`很像.
其中`compose()`之后得到的`dispatch()`函数, 是经过一层一层中间件修饰过的: 

比如, 我们有一个绑定了`store`的中间件`(middleware(store))`数组:
```javascript
[m1, m2, m3]
// 即[middleware1(store), middleware2(store), middleware3(store)]
```

那么最终得到的`dispatch()`函数就是
```javascript
let dispatch = m1(m2(m3(originDispatch)));
```

展开就是
```javascript
let dispatch = middleware1(store)(middleware2(store)(middleware3(store)(originDispatch)));
```
 拆分就是
 
 ![middleware003](/images/middleware003.jpg)

 ## 本文参考
 [Redux官方文档]()

 [精益React学习指南(Learn React) - 3.3理解redux中间件 - 陈学家_6174]()