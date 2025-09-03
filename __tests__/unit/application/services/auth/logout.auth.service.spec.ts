import {
  mockIdSanitizer,
  mockIdValidator,
  mockSessionRepository,
  mockUserIdRegisteredValidator,
  mockUserRepository,
} from "../../../../../__mocks__";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { LogoutAuthService } from "../../../../../src/application/services";

describe("LogoutAuthService", () => {
  let sut: LogoutAuthService;
  let mockedSessionRepository = mockSessionRepository();
  let mockedUserRepository = mockUserRepository();
  let mockedSanitizer = mockIdSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedUserIdValidator = mockUserIdRegisteredValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new LogoutAuthService({
      sessionRepository: mockedSessionRepository,
      userRepository: mockedUserRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      userIdValidator: mockedUserIdValidator,
    });
  });

  describe("logout", () => {
    const userId = "valid-user-id-123";
    const sanitizedUserId = "valid-user-id-123";

    it("should logout successfully with valid user ID", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockResolvedValueOnce();

      await expect(sut.logout(userId)).resolves.not.toThrow();

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(userId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedUserId);
      expect(mockedUserIdValidator.validate).toHaveBeenCalledWith(
        sanitizedUserId,
      );
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledWith(
        sanitizedUserId,
      );
    });

    it("should call sanitizer with user ID", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockResolvedValueOnce();

      await sut.logout(userId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(userId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized user ID", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockResolvedValueOnce();

      await sut.logout(userId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedUserId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call user ID validator with sanitized user ID", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockResolvedValueOnce();

      await sut.logout(userId);

      expect(mockedUserIdValidator.validate).toHaveBeenCalledWith(
        sanitizedUserId,
      );
      expect(mockedUserIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call session repository deleteByUserId with sanitized user ID", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockResolvedValueOnce();

      await sut.logout(userId);

      expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledWith(
        sanitizedUserId,
      );
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sanitizer throws", async () => {
      const sanitizerError = new Error("Invalid ID format");
      mockedSanitizer.sanitize.mockImplementationOnce(() => {
        throw sanitizerError;
      });

      await expect(sut.logout(userId)).rejects.toThrow(sanitizerError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(userId);
      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedUserIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedSessionRepository.deleteByUserId).not.toHaveBeenCalled();
    });

    it("should throw error when ID validator throws", async () => {
      const validatorError = new Error("Invalid ID");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.logout(userId)).rejects.toThrow(validatorError);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedUserId);
      expect(mockedUserIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedSessionRepository.deleteByUserId).not.toHaveBeenCalled();
    });

    it("should throw error when user ID validator throws", async () => {
      const userValidatorError = new EntityNotFoundError("Usuário");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockRejectedValueOnce(userValidatorError);

      await expect(sut.logout(userId)).rejects.toThrow(userValidatorError);

      expect(mockedUserIdValidator.validate).toHaveBeenCalledWith(
        sanitizedUserId,
      );
      expect(mockedSessionRepository.deleteByUserId).not.toHaveBeenCalled();
    });

    it("should throw error when session repository throws", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockRejectedValueOnce(
        repositoryError,
      );

      await expect(sut.logout(userId)).rejects.toThrow(repositoryError);

      expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledWith(
        sanitizedUserId,
      );
    });

    it("should handle async operations correctly", async () => {
      let resolveUserValidation: () => void;
      let resolveSessionDeletion: () => void;

      const userValidationPromise = new Promise<void>((resolve) => {
        resolveUserValidation = resolve;
      });
      const sessionDeletionPromise = new Promise<void>((resolve) => {
        resolveSessionDeletion = resolve;
      });

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockReturnValueOnce(userValidationPromise);
      mockedSessionRepository.deleteByUserId.mockReturnValueOnce(
        sessionDeletionPromise,
      );

      const logoutPromise = sut.logout(userId);

      // Should not resolve immediately
      let isResolved = false;
      logoutPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);

      // Resolve user validation first
      resolveUserValidation!();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Still should not be resolved until session deletion completes
      expect(isResolved).toBe(false);

      // Resolve session deletion
      resolveSessionDeletion!();

      await logoutPromise;
      expect(isResolved).toBe(true);
    });

    it("should handle multiple logout attempts for same user", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValue();
      mockedUserIdValidator.validate.mockResolvedValue();
      mockedSessionRepository.deleteByUserId.mockResolvedValue();

      // First logout
      await sut.logout(userId);
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledTimes(1);

      // Second logout for same user (should still work)
      await sut.logout(userId);
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenCalledTimes(2);

      expect(mockedSessionRepository.deleteByUserId).toHaveBeenNthCalledWith(
        1,
        sanitizedUserId,
      );
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenNthCalledWith(
        2,
        sanitizedUserId,
      );
    });

    it("should handle different user IDs correctly", async () => {
      const userId1 = "user-id-1";
      const userId2 = "user-id-2";
      const sanitizedUserId1 = "sanitized-user-id-1";
      const sanitizedUserId2 = "sanitized-user-id-2";

      mockedSanitizer.sanitize
        .mockReturnValueOnce(sanitizedUserId1)
        .mockReturnValueOnce(sanitizedUserId2);
      mockedIdValidator.validate.mockReturnValue();
      mockedUserIdValidator.validate.mockResolvedValue();
      mockedSessionRepository.deleteByUserId.mockResolvedValue();

      await sut.logout(userId1);
      await sut.logout(userId2);

      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(1, userId1);
      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(2, userId2);
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenNthCalledWith(
        1,
        sanitizedUserId1,
      );
      expect(mockedSessionRepository.deleteByUserId).toHaveBeenNthCalledWith(
        2,
        sanitizedUserId2,
      );
    });

    it("should not return any value", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUserId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedUserIdValidator.validate.mockResolvedValueOnce();
      mockedSessionRepository.deleteByUserId.mockResolvedValueOnce();

      const result = await sut.logout(userId);

      expect(result).toBeUndefined();
    });

    it("should validate operations are called in correct order", async () => {
      const callOrder: string[] = [];

      mockedSanitizer.sanitize.mockImplementationOnce((id) => {
        callOrder.push("sanitize");
        return id;
      });
      mockedIdValidator.validate.mockImplementationOnce(() => {
        callOrder.push("idValidate");
      });
      mockedUserIdValidator.validate.mockImplementationOnce(async () => {
        callOrder.push("userValidate");
      });
      mockedSessionRepository.deleteByUserId.mockImplementationOnce(
        async () => {
          callOrder.push("deleteSession");
        },
      );

      await sut.logout(userId);

      expect(callOrder).toEqual([
        "sanitize",
        "idValidate",
        "userValidate",
        "deleteSession",
      ]);
    });
  });
});
