/* eslint-disable @typescript-eslint/no-var-requires */
const pckg = require('./package.json')

module.exports = {
	// This configuration is only for jest
	env: {
		test: {
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							node: pckg.engines.node.replace(/[^\d.]+/g, ''),
						},
					},
				],
				"@babel/typescript"
			],
			plugins: ["@babel/proposal-class-properties"]
		},
	},
}
