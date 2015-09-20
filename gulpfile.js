var gulp = require('gulp');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');

gulp.task('styles', function() {
	gulp.src('src/css/*.scss')
	.pipe(sass({indentedSyntax: true}).on('error', sass.logError))
	.pipe(gulp.dest('public/css'))
	.pipe(concat('all.min.css'))
	.pipe(uglifycss())
	.pipe(gulp.dest('public/css'))
	.pipe(livereload());
});

gulp.task('scripts', function() {
	gulp.src('src/js/*.js')
	.pipe(gulp.dest('public/js'))
	.pipe(uglify()).on('error', function(){})
	.pipe(concat('all.min.js'))
	.pipe(gulp.dest('public/js'))
	.pipe(livereload());
});

gulp.task('jadeReload', function() {
	gulp.src('views/*.jade')
	.pipe(livereload());
});

gulp.task('watch', function() {
	livereload.listen();
	gulp.watch('src/css/*.scss', ['styles']);
	gulp.watch('src/js/*.js', ['scripts']);
	gulp.watch('views/*.jade', ['jadeReload']);
});

gulp.task('default', ['styles', 'scripts', 'watch']);
