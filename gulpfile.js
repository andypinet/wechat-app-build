const gulp = require("gulp")
var rename = require("gulp-rename");
var gap = require('gulp-append-prepend');

gulp.task('r', function() {
    gulp.src('./dist/index.js')
        .pipe(gap.prependText(`
const regeneratorRuntime = require('./static/runtime.js');
const wxp = require('./static/wx.promise.js').default;
`))
        .pipe(rename(function (path) {
            path.basename = "app";
        }))
        .pipe(gulp.dest('./dist'))
})

gulp.task('w', function() {
    gulp.watch('./dist/index.js', ['r'])
})