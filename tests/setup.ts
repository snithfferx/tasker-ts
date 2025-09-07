import '@testing-library/jest-dom';

// Mock Firebase to prevent actual Firebase calls during tests
jest.mock('../src/services/auth', () => ({
  getCurrentUserId: () => 'test-user-id',
  isAuthenticated: () => true
}));

jest.mock('../src/services/firebase', () => ({
  auth: {},
  db: {}
}));

jest.mock('../src/configs/constants', () => ({
  APP_NAME: 'Tasker Test',
  APP_DESCRIPTION: 'Test app',
  API_KEY: 'test-key',
  AUTH_DOMAIN: 'test.firebaseapp.com',
  PROJECT_ID: 'test-project',
  STORAGE_BUCKET: 'test-project.appspot.com',
  MESSAGING_SENDER_ID: '123456789',
  APP_ID: '1:123456789:web:test',
  MEASUREMENT_ID: 'G-TEST123'
}));
