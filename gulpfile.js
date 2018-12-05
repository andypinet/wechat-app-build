const gulp = require('gulp')
var rename = require('gulp-rename')
var gap = require('gulp-append-prepend')

let postcss = require('gulp-postcss')

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

gulp.task('i', function () {
  gulp
    .src('./src/_package.json')
    .pipe(
      rename(function(p) {
        p.basename = 'package'
      })
    )
    .pipe(gulp.dest('./dist'))
})

gulp.task('w', function() {
  console.log('start gulp watch')
  gulp
    .src('./dist/app.wxss')
    .pipe(postcss())
    .pipe(gulp.dest('./dist'))

  gulp
    .src('./src/_package.json')
    .pipe(
      rename(function(p) {
        p.basename = 'package'
      })
    )
    .pipe(gulp.dest('./dist'))

  gulp.watch('./dist/index.js', ['r'])
  gulp.watch('./dist/app.wxss', function() {
    return gulp
      .src('./dist/app.wxss')
      .pipe(postcss())
      .pipe(gulp.dest('./dist'))
  })

  gulp.watch('./src/_package.json', function() {
    return gulp
      .src('./src/_package.json')
      .pipe(
        rename(function(p) {
          p.basename = 'package'
        })
      )
      .pipe(gulp.dest('./dist'))
      .on('end', function() {
        console.log('transform _package.json');
      });
  })
})
