var gulp = require("gulp");
var series = gulp.series;
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
var watch = require("gulp-watch");
var clean = require("gulp-clean");
var browserSync = require("browser-sync");

var tsProject = ts.createProject("tsconfig.json");


var cleanFunc = function() {
    return gulp.src(["dist/*"]).pipe(clean());
}

var buildTS = function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(concat('main.js')).pipe(gulp.dest("dist"));
};
var buildHtml = async function () {
    return gulp.src(["src/index.html","src/texturezero.png"])
        .pipe(gulp.dest("dist"));
};

gulp.task('clean',cleanFunc);
gulp.task('buildTS',buildTS);
gulp.task('buildHtml',buildHtml);

// 启本地服务，并打开浏览器
var browser = function(){
    browserSync.init({
        server: 'dist'    // 访问目录，自动指向该目录下的 index.html 文件
        // proxy: "你的域名或IP"    // 设置代理
    });
}
gulp.watch("src/*.ts").on('change',async function(event) {
    buildTS();
    try {
        await buildHtml();
        browserSync.reload();
    } catch (error) {
        console.log(error)
    }
})
gulp.task("default",series([cleanFunc,buildTS,buildHtml,browser]))