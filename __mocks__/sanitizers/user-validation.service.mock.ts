export const mockUserValidationService = () => ({
  validateUserCreation: jest.fn(),
  validateUserPasswordUpdate: jest.fn(),
  validateUserRoleUpdate: jest.fn(),
  validateUserDeletion: jest.fn(),
  validateUserId: jest.fn(),
  validateUserIdExists: jest.fn(),
});
