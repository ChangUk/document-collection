import pkg from "./package.json";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const name = `${pkg.name}`.split("-").reduce((pre, cur) => {
	pre = pre.charAt(0).toUpperCase() + pre.slice(1)
	cur = cur.charAt(0).toUpperCase() + cur.slice(1)
	return pre + cur;
});
const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
	input: "./src/index.ts",

	// Bundled output files
	output: [{
		name: `${pkg.name}`,
		file: `dist/${pkg.name}.esm.min.js`,
		format: "esm",
		plugins: [
			terser()
		]
	}, {
		name: `${pkg.name}`,
		file: `dist/${pkg.name}.esm.js`,
		format: "esm"
	}, {
		name,
		file: `dist/${pkg.name}.umd.min.js`,
		format: "umd",
		plugins: [
			terser()
		]
	}, {
		name,
		file: `dist/${pkg.name}.umd.js`,
		format: "umd"
	}],

	// Specify external modules which you don't want to include in your bundle
	external: [],

	plugins: [
		// Allows node_modules resolution
		resolve({
			extensions
		}),

		// Allow bundling cjs modules. Rollup doesn't understand cjs
		commonjs(),

		// Compile TypeScript/JavaScript files
		babel({
			presets: ["@babel/preset-env", "@babel/preset-typescript"],
			extensions,
			babelHelpers: "runtime",
			plugins: [["@babel/plugin-transform-runtime", {
				regenerator: true,
			}]],
			include: ['src/**/*'],
		})
	],
};
