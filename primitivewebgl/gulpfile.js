var gulp = require("gulp");
var series = gulp.series;
var ts = require("gulp-typescript");
var clean = require("gulp-clean");
var browserSync = require("browser-sync");
var browserify = require("browserify");
var tsProject = ts.createProject("tsconfig.json");
const {dest} = gulp
const source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');

var cleanFunc = function() {
    return gulp.src(["dist/*"]).pipe(clean());
}

var buildTS = function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
};

var buildHtml = async function () {
    return gulp.src(["resources/*.html","resources/*.png","resources/*.mp4"])
        .pipe(gulp.dest("dist"));
};

var browserifyJS = function() {
    return browserify("dist/main.js")
      .transform("babelify", {presets: ["@babel/preset-env"]})
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(dest('dist'));
}

gulp.task('clean',cleanFunc);
gulp.task('buildTS',buildTS);
gulp.task('buildHtml',buildHtml);

// 启本地服务，并打开浏览器
var browser = function(){
    browserSync.init({
        server: 'dist'    // 访问目录，自动指向该目录下的 index.html 文件
    });
}

gulp.watch("src/*.ts").on('change',async function(_) {
    buildTS();
    browserifyJS();
    try {
        await buildHtml();
        browserSync.reload();
    } catch (error) {
        console.log(error)
    }
})


gulp.task("default",series([cleanFunc,buildTS,browserifyJS,buildHtml,browser]))