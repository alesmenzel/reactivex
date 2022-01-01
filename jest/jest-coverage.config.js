/* eslint-disable @typescript-eslint/no-var-requires */
const jestConfig = require('./jest.config.js')

module.exports = {
	...jestConfig,
	// Indicates whether the coverage information should be collected while executing the test.
	collectCoverage: true,
	// An array of glob patterns indicating a set of files for which coverage information should be collected.
	collectCoverageFrom: ['src/**/*.ts'],
}
