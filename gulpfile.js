const gulp = require('gulp')
var rename = require('gulp-rename')
var gap = require('gulp-append-prepend')

let postcss = require('gulp-postcss')

gulp.watch('./dist/app.wxss', function() {
  return gulp
    .src('./dist/app.wxss')
    .pipe(postcss())
    .pipe(gulp.dest('./dist'))
})

gulp.task('r', function() {
  let appModule = require('./template/app')

  gulp
    .src('./dist/index.js')
    .pipe(gap.prependText(appModule.bef))
    .pipe(
      rename(function(path) {
        path.basename = 'app'
      })
    )
    .pipe(gulp.dest('./dist'))

})

gulp.task('w', function() {
  gulp.watch('./dist/index.js', ['r'])
})
