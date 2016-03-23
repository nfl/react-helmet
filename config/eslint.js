module.exports = function (gulp, config) {
    var eslint = require("gulp-eslint"),
        gutil = require("gulp-util"),
        debug = require("gulp-debug"),
        cached = require("gulp-cached"),
        gulpif = require("gulp-if"),
        notify = require("gulp-notify"),
        chalk = require("chalk");

    gulp.task("eslint", function () {
        return gulp.src(config.files || "**/*.js")
            .pipe(cached("eslint"))
            .pipe(gulpif(gutil.env.debug, debug()))
            .pipe(eslint())
            .pipe(eslint.format())
            .pipe(notify(function (file) {
                if (!(file.eslint.messages || []).length) {
                    // Don't show something if success
                    return false;
                }

                var errors = file.eslint.messages.map(function (data) {
                    if (data.message) {
                        return "(" + data.line + ":" + data.column + ") " + data.message;
                    }
                    return null;
                }).join("\n");

                var errorString = file.relative + " (" + file.eslint.messages.length + " errors)\n" + errors;

                if (process.platform === "win32") {
                    errorString = chalk.stripColor(errorString);
                }

                return errorString;
            }));
    });
};
