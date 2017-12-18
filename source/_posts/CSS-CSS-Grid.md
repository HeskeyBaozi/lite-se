---
title: 自翻译:创建一个你自己的CSS栅格系统
comments: true
date: 2016-04-14 22:01:58
updated: 2016-04-14 22:01:58
categories:
- HTML/CSS
- CSS
tags:
- CSS
- 前端
- 自翻译
- Bootstrap
- CSS Grid
---
# 原文引荐

原文为[Creating Your Own CSS Grid System](http://j4n.co/blog/Creating-your-own-css-grid-system), 原网站来自[Jan Drewniak](http://j4n.co/#home)

# 前言

CSS栅格网络(CSS Grids)已经存在一段时间了。这些栅格网络往往和一些像`Bootstrap`的框架捆绑在一起使用。我并不是一个`Bootstrap`厌恶者，但是如果你真正的需要只是一个栅格网络的时候，使用一个框架也只是“焉用牛刀”。这里将展示如何从头开始制作一个你自己的CSS栅格网络。

# CSS栅格的元素

![grid-elements](http://j4n.co/content/4-blog/10-Creating-your-own-css-grid-system/grid-elements.png)
从图中我们可以看到，一个基本的栅格只包含了一些必要元素。
- 一个容器(container)
- 行(rows)
- 列(columns)
- 间隙(gutters)（指的是列与列之间的空隙）

<!-- more -->

# 容器

![container](http://j4n.co/content/4-blog/10-Creating-your-own-css-grid-system/container.png)
容器的目的就是为了设置整个栅格的`width`。这个容器的`width`通常是`100%`，你也可以设置一个`max-width`用来做大尺寸的展示。


```css
.grid-container {
        width : 100%;
        max-width : 1200px; 
    }
```

# 行

![rows](http://j4n.co/content/4-blog/10-Creating-your-own-css-grid-system/row.png)
行的目的就是阻止行内的列溢出到其他的行中。为了达到这个目的，我们将使用clearfix hack的方法来确保行内的每个元素都老老实实地呆在行内。
```css
/*-- our cleafix hack -- */ 
    .row:before, 
    .row:after {
        content:"";
        display: table ;
         clear:both;
    }
```

# 列
![columns](http://j4n.co/content/4-blog/10-Creating-your-own-css-grid-system/column.png)
列无疑是栅格网络中最复杂的一部分。在CSS中，将列定位有很多不同的方式，而且也有许多不同的width和一些类似响应式设计的因素需要考虑。在这个教程中我们将定位列并且给他们width。

## 列的定位
`Floats`, `inline-blocks`, `display-table`, `display-flex`.它们都是定位CSS中列的不同方式。以我个人经验来看，最少可能引发错误而且最广泛使用的方法就是“`float`”方法。然而，如果我们的列是空的话，我们浮动的列将会堆到其他列的顶部。为了阻止这种情况发生，我们将给我们的列设定浮动的同时，设置一个值为`1px`的`min-height`。
```css
    [class*='col-'] {
        float: left;
        min-height: 1px; 
    }
```

## 列的宽度
为了搞清楚一个列的宽度是多少，我们所要做的就是根据容器的宽度划分我们的列。在我们的这个栅格网络中，容器的`width`是`100%`，同时我们想要有6个列，所以我们的基本列宽就是`100/6 = 16.66%`
```css
    [class*='col-'] {
        float: left;
        min-height: 1px; 
        width: 16.66%; 
    }
```

当然，这只是一个开始。如果我们想要一个有着两个列宽的一个`section`，我们就得产生一个有着两个列宽的一个列。而且计算也是非常简单的。

```css
    .col-1{
        width: 16.66%; 
    }
    .col-2{
        width: 33.33%; 
    }
    .col-3{
        width: 50%; 
    }
    .col-4{
        width: 66.664%;
    }
    .col-5{
        width: 83.33%;
    }
    .col-6{
        width: 100%;
    }
```
我们唯一要注意的一件事就是，当使用这些列的组合的时候，列的总数加起来一定是6（或者其他我们打算设置的列的总数）。

## 列的间隙
![gutters](http://j4n.co/content/4-blog/10-Creating-your-own-css-grid-system/column-gutters.png)
在没有`CSS3`中`box-sizing`模型中的`border-box`属性的时候，给一个百分比宽的固定padding是真正找罪受（译者：因为如果`box-sizing`值为`content-box`，那么`width`确定的只是内容区的宽度，不会把`border`宽计算在内，这样要算width会算到你哭）。幸运的是，使用了`border-box`模型，我们就能愉悦地创建一个空隙了。
```css
    /*-- setting border box on all elements inside the grid --*/
    .grid-container *{
        box-sizing: border-box; 
    }

    [class*='col-'] {
        float: left;
        min-height: 1px; 
        width: 16.66%; 
        /*-- our gutter --*/
        padding: 12px;
    }
```

（从个人角度来看，我通常在我的CSS中使用`* {box-sizing: border-box;}`来将`border-box`适应页面中的每个元素）

# 我们的基本栅格就绪：
```html
<div class="grid-container outline">
    <div class="row">
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
    </div> 
    <div class="row">
        <div class="col-2"><p>col-2</p></div> 
        <div class="col-2"><p>col-2</p></div> 
        <div class="col-2"><p>col-2</p></div> 
    </div> 
    <div class="row">
        <div class="col-3"><p>col-3</p></div> 
        <div class="col-3"><p>col-3</p></div> 
    </div> 
</div>
```
创建以上栅格的整个HTML和CSS：

## CSS
```css
    .grid-container{
        width: 100%; 
        max-width: 1200px;      
    }

    /*-- our cleafix hack -- */ 
    .row:before, 
    .row:after {
        content:"";
          display: table ;
        clear:both;
    }

    [class*='col-'] {
        float: left; 
        min-height: 1px; 
        width: 16.66%; 
        /*-- our gutter -- */
        padding: 12px; 
        background-color: #FFDCDC;
    }

    .col-1{ width: 16.66%; }
    .col-2{ width: 33.33%; }
    .col-3{ width: 50%;    }
    .col-4{ width: 66.66%; }
    .col-5{ width: 83.33%; }
    .col-6{ width: 100%;   }

    .outline, .outline *{
        outline: 1px solid #F6A1A1; 
    }

    /*-- some extra column content styling --*/
    [class*='col-'] > p {
     background-color: #FFC2C2; 
     padding: 0;
     margin: 0;
     text-align: center; 
     color: white; 
    }
```

## HTML
```html
    <div class="grid-container outline">
        <div class="row">
            <div class="col-1"><p>col-1</p></div> 
            <div class="col-1"><p>col-1</p></div> 
            <div class="col-1"><p>col-1</p></div> 
            <div class="col-1"><p>col-1</p></div> 
            <div class="col-1"><p>col-1</p></div> 
            <div class="col-1"><p>col-1</p></div> 
        </div> 
        <div class="row">
            <div class="col-2"><p>col-2</p></div> 
            <div class="col-2"><p>col-2</p></div> 
            <div class="col-2"><p>col-2</p></div> 
        </div> 
        <div class="row">
            <div class="col-3"><p>col-3</p></div> 
            <div class="col-3"><p>col-3</p></div> 
        </div> 
    </div>

<hr/>
```

# 第二部分：使我们的栅格可响应
让我们的栅格适应移动端的布局是非常容易的。我们所需要做的就是调整列的宽度`width`。简单来说，我将适配屏幕在`800px`以下的列宽`width`加倍。唯一要小心的是行里面的最后一列。针对这一点，我们让在行中最后一个`.col-2` 和所有的`.col-1`宽度`width`设为`100%`
```css    
    @media all and (max-width:800px){
        .col-1{ width: 33.33%;    }
        .col-2{ width: 50%;        }
        .col-3{ width: 83.33%;    }
        .col-4{ width: 100%;    }
        .col-5{ width: 100%;    }
        .col-6{ width: 100%;      }

        .row .col-2:last-of-type{
            width: 100%; 
        }

        .row .col-5 ~ .col-1{
            width: 100%; 
        }
    }
```

对于尺寸比`800px`还要小的屏幕，我们将让除了最小的列以外的其他列宽度设置为`100%`

```css
    @media all and (max-width:650px){
        .col-1{ width: 50%;        }
        .col-2{ width: 100%;    }
        .col-3{ width: 100%;    }
        .col-4{ width: 100%;    }
        .col-5{ width: 100%;    }
        .col-6{ width: 100%;      }
    }
```

HTML:
```html
<div class="grid-container outline">
    <div class="row">
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
        <div class="col-1"><p>col-1</p></div> 
    </div> 
    <div class="row">
        <div class="col-2"><p>col-2</p></div> 
        <div class="col-2"><p>col-2</p></div> 
        <div class="col-2"><p>col-2</p></div> 
    </div> 
    <div class="row">
        <div class="col-3"><p>col-3</p></div> 
        <div class="col-3"><p>col-3</p></div> 
    </div> 
    <div class="row">
        <div class="col-4"><p>col-4</p></div> 
        <div class="col-2"><p>col-2</p></div> 
    </div> 
    <div class="row">
        <div class="col-5"><p>col-5</p></div> 
        <div class="col-1"><p>col-1</p></div> 
    </div> 
    <div class="row">
        <div class="col-6"><p>col-6</p></div> 
    </div> 
</div>
```

这只是一个创建你自己的系统的开始点。而且这并不是一个框架甚至也不是一个完整的解决方案，但是我希望它能揭开CSS栅格神秘的面纱。