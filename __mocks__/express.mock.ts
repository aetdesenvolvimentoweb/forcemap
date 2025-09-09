export const mockRouterMethods = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
};

export const mockRouter = jest.fn(() => mockRouterMethods);
