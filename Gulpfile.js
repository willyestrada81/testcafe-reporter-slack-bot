var gulp = require('gulp');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var del = require('del');

function clean (cb) {
    del('lib', cb);
}

function lint () {
    return gulp
        .src([
            'src/**/*.js',
            'test/**/*.js',
            'Gulpfile.js'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function build () {
    return gulp
        .src('src/**/*.js')
        .pipe(babel())
        .pipe(gulp.dest('lib'));
}

function preview () {
    var buildReporterPlugin = require('testcafe').embeddingUtils.buildReporterPlugin;
    var pluginFactory = require('./lib');
    var reporterTestCalls = require('./test/utils/reporter-test-calls');
    var plugin = buildReporterPlugin(pluginFactory);

    console.log();

    reporterTestCalls.forEach(function (call) {
        plugin[call.method].apply(plugin, call.args);
    });

    process.exit(0);
}

exports.clean = clean;
exports.lint = lint;
exports.test = gulp.series(clean, lint, build);
exports.build = gulp.series(clean, lint, build);
exports.preview = gulp.series(clean, lint, build, preview);
