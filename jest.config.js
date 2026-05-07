/** @type {import('ts-jest').JestConfigWithTsJest} **/
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
	testEnvironment: 'node',
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', {}],
		'^.+\\.js$': ['ts-jest', { tsconfig: { allowJs: true } }],
	},
	transformIgnorePatterns: [
		'/node_modules/.pnpm/(?!(detect-indent|detect-newline|@semantic-release))',
	],
	roots: ['<rootDir>'],
	modulePaths: compilerOptions.baseUrl ? [compilerOptions.baseUrl] : [],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
	}),
};
