var gulp = require("gulp");
var series = gulp.series;
var concat = require('gulp-concat');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var buildTS =  function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(concat('main.js')).pipe(gulp.dest("dist"));
};
var buildHtml = function() {
    return gulp.src("src/index.html")
        .pipe(gulp.dest("dist"));
};
gulp.task("default",series(buildTS,buildHtml))