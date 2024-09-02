import babel from 'gulp-babel';
import gulp from 'gulp';
import fs from "fs";

gulp.task('clean', () => fs.rmSync('./bin', { recursive: true, force: true }));

gulp.task('build', ['clean'], function () {
	return gulp
		.src('./src/**/*.js')
		.pipe(
			babel({
				presets: ['es2015'],
			})
		)
		.on('error', function (error) {
			console.log(error.toString());
			this.emit('end');
		})
		.pipe(gulp.dest('./bin'));
});

gulp.task('watch', ['build'], function () {
	gulp.watch('./src/**/*.js', ['build']);
});
