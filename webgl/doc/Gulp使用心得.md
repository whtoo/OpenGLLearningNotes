# Gulp个人手册

## 参考资料
1. [Gulp中文网](https://www.gulpjs.com.cn/docs/getting-started)

## 从任务(task)开始
1. Gulp中的任务
```
Tasks can be considered public or private.

Public tasks are exported from your gulpfile, which allows them to be run by the gulp command.
Private tasks are made to be used internally, usually used as part of series() or parallel() composition.
A private task looks and acts like any other task, but an end-user can't ever execute it independently. To register a task publicly, export it from your gulpfile.
```
任务就是针对我们希望的构建操作的抽象,就比如,我们将ts-》js-》bundle(main.js)这就是一个任务的定义.
另外,从上面我们也能看出,任务应该是可以组合和分割的.由于gulp的流水线作业方式(-》),我个人觉得这样定义任务很简单清爽.
2. 创建单一任务
```
gulp.task("taskName",function(){});
```
3. 创建组合任务
```
const { series } = require('gulp');

// `clean` 函数并未被导出（export），因此被认为是私有任务（private task）。
// 它仍然可以被用在 `series()` 组合中。
function clean(cb) {
  // body omitted
  cb();
}

// `build` 函数被导出（export）了，因此它是一个公开任务（public task），并且可以被 `gulp` 命令直接调用。
// 它也仍然可以被用在 `series()` 组合中。
function build(cb) {
  // body omitted
  cb();
}

exports.build = build;
exports.default = series(clean, build);
```