import {
  AuthenticateUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  FindByIdUserUseCase,
  ListAllUserUseCase,
  UpdateUserPasswordUseCase,
  UpdateUserRoleUseCase,
} from "../../src/domain/use-cases";

export const mockCreateUserService = (): jest.Mocked<CreateUserUseCase> => ({
  create: jest.fn(),
});

export const mockDeleteUserService = (): jest.Mocked<DeleteUserUseCase> => ({
  delete: jest.fn(),
});

export const mockFindByIdUserService =
  (): jest.Mocked<FindByIdUserUseCase> => ({
    findById: jest.fn(),
  });

export const mockListAllUserService = (): jest.Mocked<ListAllUserUseCase> => ({
  listAll: jest.fn(),
});

export const mockUpdateUserPasswordService =
  (): jest.Mocked<UpdateUserPasswordUseCase> => ({
    updateUserPassword: jest.fn(),
  });

export const mockUpdateUserRoleService =
  (): jest.Mocked<UpdateUserRoleUseCase> => ({
    updateUserRole: jest.fn(),
  });

export const mockAuthenticateUserService =
  (): jest.Mocked<AuthenticateUserUseCase> => ({
    authenticate: jest.fn(),
  });
