var https = require('https');
var gulp = require('gulp'),
    argv = require('yargs').argv;
var ts = require('gulp-typescript'),
    screeps = require('./gulp-screeps');
var secrets = require('./secrets.json');

function upload(branch) {
    return screeps({
        email: secrets.email,
        password: secrets.password,
        branch: branch,
        ptr: false,
    });
}

/* TypeScript */
var tsProject = ts.createProject('tsconfig.json');

gulp.task('ts-scripts', function() {
    return gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
               .pipe(ts(tsProject))
               .js.pipe(gulp.dest('dist'));
});

gulp.task('compile', ['ts-scripts']);

/* Upload */
gulp.task('upload', ['compile'], function() {
    var branch = argv.prod ? 'default' : 'develop';
    return gulp.src('dist/**/*.js').pipe(upload(branch));
});
gulp.task('watch', function() {
    gulp.watch('src/**/*.ts', ['upload']);
});

gulp.task('default', ['compile']);
