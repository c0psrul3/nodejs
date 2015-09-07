var gulp = require('gulp');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');

gulp.task('styles', function() {
	gulp.src('src/css/*.scss')
	.pipe(sass({indentedSyntax: true}).on('error', sass.logError))
	.pipe(gulp.dest('public/css'))
	.pipe(concat('all.min.css'))
	.pipe(uglifycss())
	.pipe(gulp.dest('public/css'));
});

gulp.task('scripts', function() {
	gulp.src('src/js/*.js')
	.pipe(gulp.dest('public/js'))
	.pipe(uglify()).on('error', function(){})
	.pipe(concat('all.min.js'))
	.pipe(gulp.dest('public/js'));
});

gulp.task('default', function() {
	gulp.run('styles');
	gulp.run('scripts');

	gulp.watch('src/css/*.scss', ['styles']);
	gulp.watch('src/js/*.js', ['scripts']);
});
