var gulp = require('gulp');
var imagemin = require('gulp-imagemin');


gulp.task('images', function(){
  return gulp.src('img/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});
