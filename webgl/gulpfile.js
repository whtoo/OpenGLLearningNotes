var gulp = require("gulp");
var series = gulp.series;
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
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

var buildTS = function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(concat('main.js')).pipe(gulp.dest("dist"));
};
var buildHtml = function () {
    return gulp.src("src/index.html")
        .pipe(gulp.dest("dist"));
};
gulp.task("default", series(buildTS, buildHtml))