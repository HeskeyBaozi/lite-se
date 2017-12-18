---
title: “动静结合” 小白初探静态(词法)作用域与执行环境(EC)
comments: true
date: 2016-04-07 13:31:32
updated: 2016-04-07 13:31:32
categories:
- Program Language
- JavaScript
tags:
- 前端
- JavaScript
- 作用域链
- 闭包
---
从图书馆翻过各种JS的书之后，对**作用域/执行环境/闭包**这些概念有了一个比较清晰的认识。


# 栗子说明一切

## 第一个栗子

来看一个来自[ECMA-262](http://dmitrysoshnikov.com/ecmascript/javascript-the-core/#execution-context)的栗子：
```javascript
var x = 10;

(function foo() {
  var y = 20;
  (function bar() {
    var z = 30;
    // "x" and "y" are "free variables"
    // and are found in the next (after
    // bar's activation object) object
    // of the bar's scope chain
    console.log(x + y + z);
  })();
})();
```
我们可以用下图展现上面的例子(父变量对象存储在函数的`Scope`属性内)
![scope-chain.png](http://ww2.sinaimg.cn/large/724c9a82jw1f2qt3du7k5j20650buaa5.jpg)

首先，可以很容易的理解到一个事实：在从控制台输出`x+y+z`的时候，`x`和`y`是在`bar()`函数中的作用域链中`bar()`的活动对象之下找到的。实际上，`foo()`函数和`bar()`函数在执行的时候，他们的`scope`属性就已经确定了，他们的`scope`属性**确定为他们外层的变量对象(VO)的集合**。从图中可知，内存结构可能是这样的：
<!-- more -->
```javascript
// foo的scope属性是global的VO
foo.["[[Scope]]"] = { global.["Variable Object"] }

// bar的scope属性是foo的AO和global的VO的集合
bar.["[[Scope]]"] = {foo.["Activation Object"], global.["Variable Object"]}
```

## 第二个栗子
这个例子来自《高性能Javascript》
```javascript
// 全局范围定义
function add(num1, num2) {
  var sum = num1 + num2;
  return sum;
}
```
当`add()`函数创建的时候，它的`scope`属性被确定为全局对象的VO，这个全局对象的VO可能包括`window`/`navigator`/`document`之类等等。关系如图：
![add_chain](http://ww1.sinaimg.cn/large/724c9a82jw1f2qt3exrs1j20jc05ddhi.jpg)
这个`scope`属性很特别，他是**静态的**，在函数创建的时候便能确定。图片中的作用域链，**是全局执行环境中的作用域链**。而在函数执行的时候，书中说道：

> 每个执行上下文都有自己的作用域链，用于解析标识符。当执行上下文被创建的时候，**它的作用域链初始化为当前运行函数的`scope`属性中的对象**。这些值按照他们出现在函数中的顺序，被复制到执行上下文的作用域链中。这个过程一旦完成，一个被称为“活动对象(AO)”的新对象就为执行上下文创建好了。活动对象作为函数运行时的变量对象，包含了所有的局部变量，命名参数，参数集合以及`this`。**然后此活动对象被推入作用域链的最前端**。

可以了解到，**作用域链是个链表，是在函数执行的时候才存在的，也就是函数创建执行环境的时候才开始存在的**，它先把这个函数的静态属性`scope`属性中的所有变量对象按照顺序复制到作用域链（所以这样就不会担心作用域链嵌套的问题），然后创建AO放在作用域链顶部“0号位”。例如再执行代码：
```javascript
var total = add(5, 10);
```
图片如下图：
![add_exc](http://ww2.sinaimg.cn/large/724c9a82jw1f2qt3ehbq1j20jc0bhdgo.jpg)


所以，我们也可以得到一个惊人的结论：

**函数作用域链 = 活动对象(AO) + `scope`属性**

# 关键的来了

这个结论中：活动对象(AO)是临时的，动态的，独一无二的。`scope`属性是静态的，确定的。

所以说，**函数的作用域链，是函数执行的时候动态创建的，但是它又是基于静态词法的环境(`scope`属性)**。所谓“动态创建”，是指在函数执行的时候，先创建之前没有的作用域链，再创建活动对象，然后活动对象推入作用域链最前端；所谓“基于静态的词法环境”是指函数定义的时候，这个函数本是没有作用域链的，有的只有`scope`属性，而这个属性指向了这个函数外部的执行环境，而这个外部的执行环境拥有作用域链（因为这是外部创建外部的执行环境才拥有作用域链的，这样有一点递归的味道）。~~P.S.其实有的版本也说，作用域链的确定应该是在活动变量创建完成之后的，这个有待钻研。~~
P.S 在ES5规范文档中，进入函数代码的流程：
![hanshudaima](http://ww4.sinaimg.cn/large/724c9a82jw1f2qzii6t8yj20of07q759.jpg)

# 扯到变量提升
变量提升的本质就是函数在创建执行环境中的变量对象的时候，记录下了函数声明，变量和参数等等。具体参见[深入理解Javascript之执行上下文(Execution Context)](http://davidshariff.com/blog/what-is-the-execution-context-in-javascript/)，下面是片段：
> - 建立Variable Object对象顺序：

> 1. 建立arguments对象，检查当前上下文中的参数，建立该对象下的属性以及属性值

> 2. **检查当前上下文中的函数声明：** 每找到一个函数声明，就在variableObject下面用函数名建立一个属性，属性值就是指向该函数在内存中的地址的一个引用。如果上述函数名已经存在于variableObject下，那么对应的属性值会被新的引用所覆盖。

> 3. **检查当前上下文中的变量声明：** 每找到一个变量的声明，就在variableObject下，用变量名建立一个属性，属性值为undefined。如果该变量名已经存在于variableObject属性中，直接跳过(防止指向函数的属性的值被变量属性覆盖为undefined)，原属性值不会被修改。

# 扯到闭包

闭包，在离散数学中指的是满足性质A的一个最小关系集R，这可以理解这个关系集R，在性质A上封闭。**闭包不是一种魔法**，虽然可以通过闭包扯得很远很远，通过函数的作用域链的组成为AO+`scope`属性，为快速理解闭包中变量引用来自哪里提供了思路————**没那么复杂，就直接再执行的函数定义处上看就行了**。把函数定义的作用域看成是函数执行的作用域。这也是词法作用域迷人的地方。

# Show Me the Code

说了那么多，有代码才是王道，毕竟“Talk is cheap”。

## “面向对象”一般的编程：实现封装
这段代码来自[MDN-用闭包模拟私有方法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)，有更改
```javascript
var Counter = (function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function(dis) {
      changeBy(dis);
    },
    decrement: function(dis) {
      changeBy(-dis);
    },
    value: function() {
      return privateCounter;
    }
  }
})();

console.log(Counter.value()); // 0
Counter.increment(1);
Counter.increment(2);
console.log(Counter.value()); // 3
Counter.decrement(5);
console.log(Counter.value()); // -2
```
返回的是一个对象，这个对象有三个属性，都是函数。而且这三个函数的`scope`属性都是指向一个集合，这个集合包括外层匿名函数的的AO，和全局变量的VO。分析一下`Counter.value()`这个调用：`value`这个属性对应的匿名函数定义的时候，它的`scope`属性确定，这个是词法作用域的特性，这个`scope`属性指向的是外部所有变量对象的集合（也就是上句说的那个集合）。在最后调用`Counter.value()`的时候，创建**先构建作用域链，再创建执行环境**，再创建执行环境的时候发现了一个变量标识符`privateCounter`。好，接下来在函数体内找找这个对应的值，找不到；到外层的函数，也就是那个`Counter`对应的匿名函数，诶找到了！好，将这个标识符和这个量“关联起来”。
结果，这样下来，返回的这个对象就类似于面向对象变成中的“外部接口”，而没有被返回的那部分(也就是代码中的`var privateCounter `和`function changeBy`)则成了“私有的”，无法从外部直接访问。这样的闭包模拟了数据的封装和隐藏，一股熟悉而浓郁的`C++`味道袭来。当然，这样用的确不错，但是关乎性能方面，MDN这样推荐道：
> 如果不是因为某些特殊任务而需要闭包，在没有必要的情况下，在其它函数中创建函数是不明智的，因为闭包对脚本性能具有负面影响，包括处理速度和内存消耗。
> 例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。原因是这将导致每次构造器被调用，方法都会被重新赋值一次（也就是说，为每一个对象的创建）。

## 执行环境到底是怎么建立的？
下面片段来自[深入理解Javascript之执行上下文(Execution Context)](http://davidshariff.com/blog/what-is-the-execution-context-in-javascript/)
```javascript
  function foo(i) {
   var a = 'hello';
   var b = function privateB() {

   };
   function c() {

   }
}

foo(22);
```
在调用`foo(22)`的时候，建立阶段如下:
```javascript
fooExecutionContext = {
   variableObject: {  // 变量对象
       arguments: {
           0: 22,
           length: 1
       },
       i: 22, // 形式参数声明在函数声明前
       c: pointer to function c() // 注意，函数声明在变量声明前
       a: undefined,
       b: undefined
   },
   // 作用链和变量对象顺序问题，有待钻研，T.T
   // 在官方文档中，貌似是作用域链先被创建(而且被称作词法环境组件)
   scopeChain: { ... },
   this: { ... }
}
```
由此可见，在建立阶段，除了arguments，函数的声明，以及参数被赋予了具体的属性值，其它的变量属性默认的都是undefined。一旦上述建立阶段结束，引擎就会进入代码执行阶段，这个阶段完成后，上述执行上下文对象如下:
```javascript
fooExecutionContext = {
   variableObject: {
       arguments: {
           0: 22,
           length: 1
       },
       i: 22,
       c: pointer to function c()
       a: 'hello',
       b: pointer to function privateB()
   },
   scopeChain: { ... },
   this: { ... }
}
```
我们看到，**只有在代码执行阶段，变量属性才会被赋予具体的值**。

# 总结一下

- 分析代码的时候，务必回看函数的定义，毕竟人家函数是**一等贵族**。
- 记住**函数作用域链 = (动)活动对象(AO) + (静)`scope`属性**。
- 执行环境结构：![ec](http://ww2.sinaimg.cn/large/724c9a82jw1f2qt3dkqtpj209g06xq2x.jpg)
- 执行环境创建后，才开始执行代码，变量对象才开始被赋值
- 变量提升 ==> 变量对象的创建
- 闭包 ===> 作用域链中静态的部分，即`scope`属性

# 官方文档的补充
![执行环境](http://ww2.sinaimg.cn/large/724c9a82jw1f2qzlxkfc3j20qc04rgm6.jpg)
我的理解：词法环境组件 ≈ 作用域；变量环境组件 ≈ 变量对象；
![全局](http://ww3.sinaimg.cn/mw690/724c9a82jw1f2qzly0iupj20dh086gm2.jpg)
以初始化全局代码的时候，貌似是创建变量对象在先。(这样有什么特殊的意义吗？)

