/** @type {import("ts-jest").JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        "types": ["node", "jest"],
        "module": "esnext",
        "moduleResolution": "node16",
        "target": "es2022",
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "isolatedModules": true,
        "allowJs": true
      },
    }],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!memoize|@octokit)"
  ],
  moduleNameMapper: {
    "^(\\.{1,2}/.+)\.js$": "$1",
  },
  extensionsToTreatAsEsm: [".ts"],
};