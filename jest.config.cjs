/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  moduleNameMapper: {
    '^@Components/(.*)$': '<rootDir>/src/components/$1',
    '^@Layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^@Pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@Hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@Services/(.*)$': '<rootDir>/src/services/$1',
    '^@Utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@Types/(.*)$': '<rootDir>/src/types/$1',
    '^@Contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@Styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@Assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@Configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@Stores/(.*)$': '<rootDir>/src/stores/$1',
  },

  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx)'
  ],
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/configs/**/*'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};
