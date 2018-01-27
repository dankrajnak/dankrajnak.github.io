var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');

// This runs after files are generated, but before they are written
// to the file system.  Therefore, this won't update correctly.
// Not sure how to fix this.
hexo.on('generateAfter', ()=>{
    gulp.src(['public/js/classes/*.js'])
        .pipe(concat('classes.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js/classes/min'))

})
