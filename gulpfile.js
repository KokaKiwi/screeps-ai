var https = require('https');
var gulp = require('gulp');
var ts = require('gulp-typescript'),
    screeps = require('gulp-screeps');
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
var tsProject = ts.createProject({
    module: 'commonjs',
    target: 'es5',
    sourceMap: false,
    noResolve: false,
    noImplicitAny: false,
});

gulp.task('ts-scripts', function() {
    return gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
               .pipe(ts(tsProject))
               .js.pipe(gulp.dest('dist'));
});

gulp.task('compile', ['ts-scripts']);

/* Sim */
gulp.task('upload-sim', ['compile'], function() {
    return gulp.src('dist/**/*.js').pipe(upload('develop'));
});
gulp.task('watch-sim', function() {
    gulp.watch('src/**/*.ts', ['upload-sim']);
});

/* Default */
gulp.task('upload', ['compile'], function() {
    return gulp.src('dist/**/*.js').pipe(upload('default'));
});

gulp.task('default', ['compile']);
