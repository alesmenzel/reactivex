import path from "path"
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import progress from 'rollup-plugin-progress'
import { terser } from 'rollup-plugin-terser'

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx']
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
		external: ['react', 'react-dom'], // React is required as peer dependency
		plugins: [
			// Locate modules using the Node resolution algorithm, for using third party modules in node_modules
			resolve({ extensions: EXTENSIONS }),
			// Compile JSNEXT
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig-build.json'),
      }),
      // Convert CommonJS modules to ES6, so they can be included in a Rollup bundle
			commonjs({ include: 'node_modules/**' }),
			// Minify
			terser(),
			// Show a nice progress bar
			progress(),
		],
	},
]
