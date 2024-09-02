const babel = require('gulp-babel');
const {dest, series, src, watch} = require('gulp');
const fs = require('fs');

const cleanTask = async () => fs.rmSync('./bin', {recursive: true, force: true});

const buildTask = () => src('./src/**/*.js')
	.pipe(babel({
		presets: ['@babel/env'],
	}))
	.on('error', function (error) {
		console.log(error.toString());
		this.emit('end');
	})
	.pipe(dest('./bin'));

const watchTask = () => watch('./src/**/*.js', series(cleanTask, buildTask));

exports.clean = cleanTask;
exports.build = series(cleanTask, buildTask);
exports.watch = watchTask;
