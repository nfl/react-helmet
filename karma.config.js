// Karma configuration

module.exports = function(config) {
    function normalizationBrowserName(browser) {
        return browser.toLowerCase().split(/[ /-]/)[0];
    }

    config.set({
        // ... normal karma configuration
        basePath: "",

        // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
        browserNoActivityTimeout: 60000,

        client: {
            mocha: {
                bail: true,
                reporter: "html"
            }
        },

        // frameworks to use
        frameworks: ["chai-sinon", "mocha"],

        files: ["./test/test.js"],

        preprocessors: {
            // add webpack as preprocessor
            "./test/test.js": ["webpack", "sourcemap"]
        },

        coverageReporter: {
            dir: "coverage/json",
            includeAllSources: true,
            reporters: [
                {
                    type: "json",
                    subdir: normalizationBrowserName
                }
            ]
        },

        webpack: {
            devtool: "inline-source-map",
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        // exclude this dirs from coverage
                        exclude: [/node_modules/],
                        loader: "babel-loader"
                    }
                ]
            },
            watch: true
        },

        webpackServer: {
            noInfo: true
        },

        // test results reporter to use
        // possible values: "dots", "progress", "junit", "growl", "coverage"
        reporters: ["coverage", "spec"],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: process.env.TRAVIS
            ? ["ChromeTravis", "PhantomJS"]
            : ["Chrome", "PhantomJS", "Firefox"],

        customLaunchers: {
            ChromeTravis: {
                base: "Chrome",
                flags: ["--no-sandbox"]
            }
        },

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true
    });
};
