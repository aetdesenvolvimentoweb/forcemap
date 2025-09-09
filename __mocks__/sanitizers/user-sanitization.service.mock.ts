export const mockUserSanitizationService = () => ({
  sanitizeId: jest.fn(),
  sanitizeUserCreation: jest.fn(),
  sanitizeUserCredentials: jest.fn(),
  sanitizePasswordUpdate: jest.fn(),
  sanitizeRoleUpdate: jest.fn(),
});
