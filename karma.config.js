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

        files: ["./test/*.js"],

        preprocessors: {
            "./test/*.js": ["rollup", "sourcemap"]
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

        rollupPreprocessor: {
            output: {
                format: "iife",
                name: "helmet",
                sourcemap: "inline"
            },
            plugins: [
                require("rollup-plugin-replace")({
                    "process.env.NODE_ENV": "'development'"
                }),
                require("rollup-plugin-babel")({
                    exclude: "node_modules/**",
                    plugins: [
                        [
                            "istanbul",
                            {
                                exclude: ["**/node_modules/**", "**/test/**"]
                            }
                        ]
                    ]
                }),
                require("rollup-plugin-node-resolve")({
                    browser: true
                }),
                require("rollup-plugin-commonjs")()
            ]
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
        browsers: process.env.TRAVIS ? ["ChromeTravis"] : ["Chrome", "Firefox"],

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
