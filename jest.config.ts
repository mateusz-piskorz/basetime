import type { Config } from 'jest';

const config: Config = {
    setupFilesAfterEnv: ['<rootDir>/src/tests/utils/jest.setup.ts'],
    coverageProvider: 'v8',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(ts|tsx)$': ['babel-jest', { configFile: './src/tests/babel.config.js' }],
        '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './src/tests/babel.config.js' }],
    },
    transformIgnorePatterns: ['node_modules/(?!jose)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

export default config;
