// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
	rootDir: '../',
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	// Make calling deprecated APIs throw helpful error messages
	errorOnDeprecated: true,
	// The glob patterns Jest uses to detect test files
	testMatch: ['<rootDir>/**/*.test.ts'],
	// An array of file extensions your modules use
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
	// An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
	testPathIgnorePatterns: [
		"<rootDir>/node_modules/",
		'<rootDir>/dist/',
		'<rootDir>/coverage/',
	],
}
