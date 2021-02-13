import path from "path"
import babel from 'rollup-plugin-babel'
import json from '@rollup/plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import progress from 'rollup-plugin-progress'
import { terser } from 'rollup-plugin-terser'
import {version as babelRuntimeVersion} from "@babel/runtime/package.json"

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json']
const DIST = path.resolve(__dirname, 'dist')

export default [
	// ES module
	{
		input: 'src/index.ts',
		output: [
			{
				file: path.resolve(DIST, 'reactivex.js'),
				format: 'es',
				sourcemap: true,
				indent: false,
			},
		],
		external: ['react'], // React is required as peer dependency
		plugins: [
			// Locate modules using the Node resolution algorithm, for using third party modules in node_modules
			resolve({ extensions: EXTENSIONS }),
			// Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
			commonjs({ include: 'node_modules/**' }),
			// Load json files
			json(),
			// Compile JSNEXT
			babel({
				sourceMaps: true,
				runtimeHelpers: true, // Instead of including babel runtime helpers in each file, add a reference
				babelrc: false,
				include: 'src/**',
				extensions: EXTENSIONS,
				presets: [
					[
						'@babel/preset-env',
						{
							modules: false, // Do not transpile import/export with babel, it is handled by rollup
							loose: true, // Allow loose transformation - use browser implementation whenever possible
							ignoreBrowserslistConfig: true, // Use the target defined here
							targets: {
								// Let the end user compile it down to desired target
								browsers: 'last 2 Chrome versions',
							},
							// Do not transpile async/await and generators*
							exclude: [
								'transform-async-to-generator',
								'transform-regenerator',
							],
						}
					],
					'@babel/typescript',
				],
				plugins: [
					"@babel/proposal-class-properties",
					[
						// Exract babel runtime helpers so they are defined only once per project
						'@babel/plugin-transform-runtime',
						{
							version: babelRuntimeVersion,
							useESModules: true,
						},
					],
				],
			}),
			// Minify
			terser(),
			// Show a nice progress bar
			progress(),
		],
	},
]
