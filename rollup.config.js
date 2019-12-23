import babel from "rollup-plugin-babel";

import pkg from "./package.json";

const baseConfig = {
    input: "src/HelmetLib.js",
    plugins: [
        babel({
            exclude: "node_modules/**"
        })
    ],
    external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.peerDependencies)
    ]
};

export default [
    Object.assign(
        {
            output: {
                file: pkg.main,
                format: "cjs"
            }
        },
        baseConfig
    ),
    Object.assign(
        {
            output: {
                file: "es/Helmet.js",
                format: "esm"
            }
        },
        baseConfig
    )
];
