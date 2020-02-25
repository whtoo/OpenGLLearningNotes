var gulp = require("gulp");
var series = gulp.series;
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
var watch = require("gulp-watch");
var clean = require("gulp-clean");
var browserSync = require("browser-sync");

var tsProject = ts.createProject("tsconfig.json");
//引入webserver插件
var webserver = require('gulp-webserver');

gulp.task('webserver', function () {
    gulp.src('./dist')
        .pipe(webserver({
            port: 18080,//端口
            host: '127.0.0.1',//域名
            liveload: true,//实时刷新代码。不用f5刷新
        }))
});

var cleanFunc = function() {
    return gulp.src(["dist/*"]).pipe(clean());
}

var buildTS = function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(concat('main.js')).pipe(gulp.dest("dist"));
};
var buildHtml = function () {
    return gulp.src("src/index.html")
        .pipe(gulp.dest("dist"));
};

gulp.task('clean',cleanFunc);
gulp.task('buildTS',buildTS);
gulp.task('buildHtml',buildHtml);
var watchSync = function(){
    w('./src/*.ts','buildTS');

    function w(path,task) {
        watch(path,function(){
            gulp.start(task);
            browserSync.reload();
        })
    }
};

// 启本地服务，并打开浏览器
var browser = function(){
    browserSync.init({
        server: 'dist'    // 访问目录，自动指向该目录下的 index.html 文件
        // proxy: "你的域名或IP"    // 设置代理
    });
}

gulp.task("default",series([cleanFunc,buildTS,buildHtml,browser,watchSync]))