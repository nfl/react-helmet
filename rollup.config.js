import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import uglify from "rollup-plugin-uglify";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";

const input = "./src/index.js";

const getBabelOptions = () => ({
  exclude: "**/node_modules/**",
  plugins: ["external-helpers"]
});

export default [
  {
    input,
    output: {
      file: "dist/react-helmet.umd.js",
      format: "umd",
      name: "ReactHelmet",
      globals: { react: "React" }
    },
    external: ["react"],
    plugins: [
      nodeResolve(),
      babel(getBabelOptions()),
      commonjs({ include: "**/node_modules/**" }),
      replace({ "process.env.NODE_ENV": JSON.stringify("development") }),
      sizeSnapshot()
    ]
  },

  {
    input,
    output: {
      file: "dist/react-helmet.min.js",
      format: "umd",
      name: "ReactHelmet",
      globals: { react: "React" }
    },
    external: ["react"],
    plugins: [
      nodeResolve(),
      babel(getBabelOptions()),
      commonjs({ include: "**/node_modules/**" }),
      replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
      sizeSnapshot(),
      uglify()
    ]
  }
];
