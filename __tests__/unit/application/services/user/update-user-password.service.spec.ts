import {
  mockPasswordHasher,
  mockUserRepository,
} from "../../../../../__mocks__";
import {
  IdSanitizerProtocol,
  UpdateUserPasswordSanitizerProtocol,
  UpdateUserPasswordValidatorProtocol,
} from "../../../../../src/application/protocols";
import { UpdateUserPasswordService } from "../../../../../src/application/services";
import { UpdateUserInputDTO } from "../../../../../src/domain/dtos";

describe("UpdateUserPasswordService", () => {
  let sut: UpdateUserPasswordService;
  let mockedRepository = mockUserRepository();
  let mockedPasswordHasher = mockPasswordHasher();
  let mockedUpdateUserPasswordValidator: jest.Mocked<UpdateUserPasswordValidatorProtocol>;
  let mockedUpdateUserPasswordSanitizer: jest.Mocked<UpdateUserPasswordSanitizerProtocol>;
  let mockedIdSanitizer: jest.Mocked<IdSanitizerProtocol>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUpdateUserPasswordValidator = {
      validate: jest.fn(),
    } as any;

    mockedUpdateUserPasswordSanitizer = {
      sanitize: jest.fn(),
    } as any;

    mockedIdSanitizer = {
      sanitize: jest.fn(),
    } as any;

    sut = new UpdateUserPasswordService({
      repository: mockedRepository,
      passwordHasher: mockedPasswordHasher,
      updateUserPasswordValidator: mockedUpdateUserPasswordValidator,
      updateUserPasswordSanitizer: mockedUpdateUserPasswordSanitizer,
      idSanitizer: mockedIdSanitizer,
    } as any);
  });

  describe("updateUserPassword", () => {
    const userId = "user-id-123";
    const sanitizedUserId = "sanitized-user-id-123";
    const mockInputData: UpdateUserInputDTO = {
      currentPassword: "currentPassword123!@#",
      newPassword: "newPassword456$%^",
    };
    const sanitizedData: UpdateUserInputDTO = {
      currentPassword: "currentPassword123!@#",
      newPassword: "newPassword456$%^",
    };
    const hashedNewPassword = "hashedNewPassword456$%^";

    const mockUser = {
      id: sanitizedUserId,
      password: "hashedCurrentPassword123!@#",
    };

    it("should update user password successfully", async () => {
      mockedIdSanitizer.sanitize.mockReturnValue(sanitizedUserId);
      mockedUpdateUserPasswordSanitizer.sanitize.mockReturnValue(sanitizedData);
      mockedUpdateUserPasswordValidator.validate.mockResolvedValue(undefined);
      mockedRepository.findByIdWithPassword.mockResolvedValue(mockUser as any);
      mockedPasswordHasher.compare.mockResolvedValue(true);
      mockedPasswordHasher.hash.mockResolvedValue(hashedNewPassword);
      mockedRepository.updateUserPassword.mockResolvedValue(undefined);

      await sut.updateUserPassword(userId, mockInputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(userId);
      expect(mockedUpdateUserPasswordSanitizer.sanitize).toHaveBeenCalledWith(
        mockInputData,
      );
      expect(mockedUpdateUserPasswordValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
      );
      expect(mockedRepository.findByIdWithPassword).toHaveBeenCalledWith(
        sanitizedUserId,
      );
      expect(mockedPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.currentPassword,
        mockUser.password,
      );
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.newPassword,
      );
      expect(mockedRepository.updateUserPassword).toHaveBeenCalledWith(
        sanitizedUserId,
        {
          ...sanitizedData,
          newPassword: hashedNewPassword,
        },
      );
    });

    it("should throw error if user not found", async () => {
      mockedIdSanitizer.sanitize.mockReturnValue(sanitizedUserId);
      mockedUpdateUserPasswordSanitizer.sanitize.mockReturnValue(sanitizedData);
      mockedUpdateUserPasswordValidator.validate.mockResolvedValue(undefined);
      mockedRepository.findByIdWithPassword.mockResolvedValue(null);

      await expect(
        sut.updateUserPassword(userId, mockInputData),
      ).rejects.toThrow("Usuário não encontrado");

      expect(mockedPasswordHasher.compare).not.toHaveBeenCalled();
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw error if current password is incorrect", async () => {
      mockedIdSanitizer.sanitize.mockReturnValue(sanitizedUserId);
      mockedUpdateUserPasswordSanitizer.sanitize.mockReturnValue(sanitizedData);
      mockedUpdateUserPasswordValidator.validate.mockResolvedValue(undefined);
      mockedRepository.findByIdWithPassword.mockResolvedValue(mockUser as any);
      mockedPasswordHasher.compare.mockResolvedValue(false);

      await expect(
        sut.updateUserPassword(userId, mockInputData),
      ).rejects.toThrow("O campo Senha atual é inválido: incorreta.");

      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should throw error if validation fails", async () => {
      const validationError = new Error("Validation failed");

      mockedIdSanitizer.sanitize.mockReturnValue(sanitizedUserId);
      mockedUpdateUserPasswordSanitizer.sanitize.mockReturnValue(sanitizedData);
      mockedUpdateUserPasswordValidator.validate.mockRejectedValue(
        validationError,
      );

      await expect(
        sut.updateUserPassword(userId, mockInputData),
      ).rejects.toThrow(validationError);

      expect(mockedRepository.findByIdWithPassword).not.toHaveBeenCalled();
    });
  });
});
