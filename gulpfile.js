var gulp = require("gulp");
var babel = require("gulp-babel");    // 用于ES6转化ES5
var uglify = require('gulp-uglify'); // 用于压缩 JS
var minifyCSS = require('gulp-minify-css');   ////用于压缩css文件
var imagemin = require('gulp-imagemin');   ////用于压缩image文件
var revCollector = require('gulp-rev-collector'); //用于更新引入静态资源路径
var clean = require('gulp-clean');  //清理
var rev = require('gulp-rev');  //更改版本号
var rename = require('gulp-rename');    //更改名称


gulp.task('clean', () => 
    gulp.src('dist', {read: false})
    .pipe(clean())
)


// 压缩 js 文件
// 在命令行使用 gulp script 启动此任务
gulp.task('js', () => 
    // 1. 找到文件
    gulp.src(['js/**/!(*.min).js', '!js/awardRotate.js'])
    //////把ES6代码转成ES5代码
    .pipe(babel())
    // 2. 压缩文件
    .pipe(uglify())
    .pipe(rename(function(path) {
        // path.basename += '.min';
        path.extname = '.js';
    }))
    .pipe(rev())
    .pipe(gulp.dest('dist/js'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/rev/js'))
);

gulp.task('css',() =>
     gulp.src('css/**/*.css')
    .pipe(minifyCSS())
    .pipe(rename(function(path) {
        // path.basename += '.min';
        path.extname = '.css';
    }))
    .pipe(rev())
    .pipe(gulp.dest('dist/css'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/rev/css'))
);

gulp.task('img', () => 
    gulp.src('img/**/*.*')
    .pipe(imagemin({progressive:true}))
    .pipe(gulp.dest('dist/img'))
);

gulp.task('copyJs', () => 
    gulp.src('js/**/*.min.js')
      .pipe(gulp.dest('dist/js'))
);

gulp.task('copyLayui', () => 
    gulp.src('layui/**')
      .pipe(gulp.dest('dist/layui'))
);

gulp.task('copyServer', () => 
    gulp.src(['server/**', '!server/node_modules/**'])
      .pipe(gulp.dest('dist/server'))
);

gulp.task('copyTxt', () => 
    gulp.src(['./*.txt'])
      .pipe(gulp.dest('dist/'))
);

//Html替换css、js文件版本
gulp.task('rev', () => 
    gulp.src(['dist/rev/**/*.json', './**/*.html', '!node_modules/**'])
        .pipe(revCollector({
            replaceReved: true,//允许替换
            // dirReplacements: {
            //     'css': 'dist/css',
            //     'js': 'dist/js'
            // }
        }))
        .pipe(gulp.dest('dist/'))
);

gulp.task('default', gulp.series('clean', gulp.parallel('css', 'js', 'img', 'copyJs', 'copyLayui', 'copyServer', 'copyTxt'), 'rev'));

