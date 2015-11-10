module.exports = function (gulp) {
    var del = require("del");

    // Remove existing stuff
    gulp.task("clean", function (cb) {
        del("./lib", cb);
    });
};
