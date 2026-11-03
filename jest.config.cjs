module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  projects: [
    {
      displayName: "unit",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/unit/**/*.test.cjs"],
    },
    {
      displayName: "integration",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/integration/**/*.test.cjs"],
      testTimeout: 10000,
    },
  ],
};
