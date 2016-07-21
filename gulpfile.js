// Dependencies
var gulp = require("gulp");

var jsFiles = [
    "{config,src}/**/*.js",
    "*.js{,x}"
];

// Clean build folder
require("./config/clean")(gulp);

// Link your JavaScript
require("./config/eslint")(gulp, {
    files: jsFiles
});
