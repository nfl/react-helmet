import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

const baseConfig = {
    input: "src/Helmet.js",
    plugins: [
        babel({
            exclude: "node_modules/**"
        }),
        typescript()
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
    ),
    Object.assign(
        {
            output: {
                file: "lib/main.d.ts",
                format: "cjs"
            }
        },
        baseConfig
    )
];
