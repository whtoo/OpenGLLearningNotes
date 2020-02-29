# Typescript 编译与构建知识记录

## 疑似tsc依赖编译bug
如果,父类的名字的字典序大雨子类,则有可能(在我的项目里面)编译后的js代码中会产生父类定义和声明都在子类后,而子类内部却引用了未定义的父类信息.

## tsc引入javascript
关键在于理解js对ts来说相当于什么?个人认为,ts内部是把js当作了host和外挂插件.
所以,如果我们要使用非系统的js库(有types那种),则需要在tsconfig里面的
```
 "compilerOptions": {
        "noImplicitAny": false,
        "target": "es6",
        "esModuleInterop": true,
        "baseUrl": ".",
       "paths": {
            "three":["node_modules/three/src/Three"],
            "gl-matrix":["node_modules/gl-matrix/index"]
        }
    }
```
|  <font color=#0099ff face="黑体">"paths": {
            "three":["node_modules/three/src/Three"],
            "gl-matrix":["node_modules/gl-matrix/index"]
        }</font>