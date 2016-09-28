// Dependencies
var gulp = require("gulp");

var jsFiles = [
    "{config,src}/**/*.js",
    "*.js{,x}"
];

// Link your JavaScript
require("./config/eslint")(gulp, {
    files: jsFiles
});
