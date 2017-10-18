var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');




gulp.task('default', function(){
    runSequence('buildJS', 'buildAllJS', 'distJS', 'buildCSS', 'distCSS');
});

gulp.task('buildCSS', function (){
    return gulp.src('src/css/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('build/css'));      
})

gulp.task('distCSS', function (){
    return gulp.src(['vendor/**/*.css', 'build/css/main.css'])
        .pipe(concat('all.css'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('dist'));
})

gulp.task('buildJS', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('build/js'));
});

gulp.task('buildAllJS', function(){
    return gulp.src(['src/**/!(main)*.js', 'src/js/main.js'])
        .pipe(concat('all.js'))    
        .pipe(babel())
        .pipe(gulp.dest('build/js'));
});

gulp.task('distJS', function(){
    return gulp.src(['vendor/**/*.js', 'build/js/all.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
  return gulp.src('img/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});

gulp.task('watch', function(){
    runSequence('buildJS', 'buildAllJS', 'distJS', 'buildCSS', 'distCSS');
    gulp.watch('src/**/*.js', function(){
        runSequence('buildJS', 'buildAllJS', 'distJS');
    });
    gulp.watch('src/**/*.scss', function(){
        runSequence('buildCSS', 'distCSS');
    })
})