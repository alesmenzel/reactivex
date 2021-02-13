module.exports = {
	// This configuration is only for jest
	env: {
		test: {
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							node: "current",
						},
					},
				],
				"@babel/typescript"
			],
			plugins: ["@babel/proposal-class-properties"]
		},
	},
}
