import {
  mockIdSanitizer,
  mockIdValidator,
  mockMilitaryDeletionPermissionValidator,
  mockMilitaryIdRegisteredValidator,
  mockMilitaryInUseValidator,
  mockMilitaryRepository,
} from "../../../../../__mocks__";
import { DeleteMilitaryService } from "../../../../../src/application/services";

describe("DeleteMilitaryService", () => {
  let sut: DeleteMilitaryService;
  let mockedRepository = mockMilitaryRepository();
  let mockedSanitizer = mockIdSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockMilitaryIdRegisteredValidator();
  let mockedInUseValidator = mockMilitaryInUseValidator();
  let mockedDeletionPermissionValidator =
    mockMilitaryDeletionPermissionValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new DeleteMilitaryService({
      militaryRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
      inUseValidator: mockedInUseValidator,
      deletionPermissionValidator: mockedDeletionPermissionValidator,
    });
  });

  describe("delete", () => {
    const inputId = "military-id-123";
    const sanitizedId = "clean-military-id-123";

    it("should delete military successfully with valid id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await expect(sut.delete(inputId)).resolves.not.toThrow();
    });

    it("should call sanitizer with input id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository delete with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedRepository.delete).toHaveBeenCalledWith(sanitizedId);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should call inUseValidator during additional validations", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedInUseValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedInUseValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should execute operations in correct order without requestingUserRole", async () => {
      const executionOrder: string[] = [];

      mockedSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("sanitize");
        return sanitizedId;
      });

      mockedIdValidator.validate.mockImplementation(() => {
        executionOrder.push("idValidate");
      });

      mockedIdRegisteredValidator.validate.mockImplementation(async () => {
        executionOrder.push("idRegisteredValidate");
      });

      mockedInUseValidator.validate.mockImplementation(async () => {
        executionOrder.push("inUseValidate");
      });

      mockedRepository.delete.mockImplementation(async () => {
        executionOrder.push("delete");
      });

      await sut.delete(inputId);

      expect(executionOrder).toEqual([
        "sanitize",
        "idValidate",
        "idRegisteredValidate",
        "inUseValidate",
        "delete",
      ]);
    });

    it("should execute operations in correct order with requestingUserRole", async () => {
      const executionOrder: string[] = [];
      const userRole = "ADMIN" as any;

      mockedSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("sanitize");
        return sanitizedId;
      });

      mockedIdValidator.validate.mockImplementation(() => {
        executionOrder.push("idValidate");
      });

      mockedIdRegisteredValidator.validate.mockImplementation(async () => {
        executionOrder.push("idRegisteredValidate");
      });

      mockedDeletionPermissionValidator.validate.mockImplementation(
        async () => {
          executionOrder.push("deletionPermissionValidate");
        },
      );

      mockedInUseValidator.validate.mockImplementation(async () => {
        executionOrder.push("inUseValidate");
      });

      mockedRepository.delete.mockImplementation(async () => {
        executionOrder.push("delete");
      });

      await sut.delete(inputId, userRole);

      expect(executionOrder).toEqual([
        "sanitize",
        "idValidate",
        "idRegisteredValidate",
        "deletionPermissionValidate",
        "inUseValidate",
        "delete",
      ]);
    });

    it("should use sanitized id for all validations and repository", async () => {
      const differentSanitizedId = "different-clean-id";

      mockedSanitizer.sanitize.mockReturnValueOnce(differentSanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedInUseValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedRepository.delete).toHaveBeenCalledWith(
        differentSanitizedId,
      );
    });

    it("should propagate sanitizer exceptions", async () => {
      const sanitizerError = new Error("Sanitization failed");

      mockedSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.delete(inputId)).rejects.toThrow(sanitizerError);

      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate id validator exceptions", async () => {
      const validatorError = new Error("Invalid ID format");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.delete(inputId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate id registered validator exceptions", async () => {
      const registeredValidatorError = new Error("Military not found");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(
        registeredValidatorError,
      );

      await expect(sut.delete(inputId)).rejects.toThrow(
        registeredValidatorError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedInUseValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockRejectedValueOnce(repositoryError);

      await expect(sut.delete(inputId)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedInUseValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should handle empty string after sanitization", async () => {
      const emptySanitizedId = "";

      mockedSanitizer.sanitize.mockReturnValueOnce(emptySanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(emptySanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        emptySanitizedId,
      );
      expect(mockedInUseValidator.validate).toHaveBeenCalledWith(
        emptySanitizedId,
      );
      expect(mockedRepository.delete).toHaveBeenCalledWith(emptySanitizedId);
    });

    it("should not return any value", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      const result = await sut.delete(inputId);

      expect(result).toBeUndefined();
    });

    it("should handle concurrent calls independently", async () => {
      const id1 = "military-id-1";
      const id2 = "military-id-2";
      const sanitized1 = "clean-id-1";
      const sanitized2 = "clean-id-2";

      mockedSanitizer.sanitize
        .mockReturnValueOnce(sanitized1)
        .mockReturnValueOnce(sanitized2);

      mockedIdValidator.validate.mockReturnValueOnce().mockReturnValueOnce();

      mockedIdRegisteredValidator.validate
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      mockedInUseValidator.validate
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      mockedRepository.delete.mockResolvedValueOnce().mockResolvedValueOnce();

      await Promise.all([sut.delete(id1), sut.delete(id2)]);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedInUseValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(2);

      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(1, id1);
      expect(mockedSanitizer.sanitize).toHaveBeenNthCalledWith(2, id2);
    });

    it("should handle UUID format ids", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      const sanitizedUuidId = "550e8400-e29b-41d4-a716-446655440000";

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedUuidId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedInUseValidator.validate.mockResolvedValueOnce();
      mockedRepository.delete.mockResolvedValueOnce();

      await sut.delete(uuidId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(uuidId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedUuidId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedUuidId,
      );
      expect(mockedRepository.delete).toHaveBeenCalledWith(sanitizedUuidId);
    });
  });

  describe("delete with requestingUserRole", () => {
    const inputId = "military-id-123";
    const sanitizedId = "clean-military-id-123";
    const userRole = "ADMIN" as any;

    beforeEach(() => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockReturnValue();
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedDeletionPermissionValidator.validate.mockResolvedValue();
      mockedInUseValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();
    });

    it("should delete military successfully with requestingUserRole", async () => {
      await expect(sut.delete(inputId, userRole)).resolves.not.toThrow();
    });

    it("should call deletionPermissionValidator with sanitized id and user role", async () => {
      await sut.delete(inputId, userRole);

      expect(mockedDeletionPermissionValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
        userRole,
      );
      expect(mockedDeletionPermissionValidator.validate).toHaveBeenCalledTimes(
        1,
      );
    });

    it("should not call deletionPermissionValidator when requestingUserRole is undefined", async () => {
      await sut.delete(inputId, undefined);

      expect(mockedDeletionPermissionValidator.validate).not.toHaveBeenCalled();
    });

    it("should not call deletionPermissionValidator when requestingUserRole is null", async () => {
      await sut.delete(inputId, null as any);

      expect(mockedDeletionPermissionValidator.validate).not.toHaveBeenCalled();
    });

    it("should propagate deletionPermissionValidator exceptions", async () => {
      const permissionError = new Error("No permission to delete");
      mockedDeletionPermissionValidator.validate.mockRejectedValueOnce(
        permissionError,
      );

      await expect(sut.delete(inputId, userRole)).rejects.toThrow(
        permissionError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDeletionPermissionValidator.validate).toHaveBeenCalledTimes(
        1,
      );
      expect(mockedInUseValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should call all validators with requestingUserRole", async () => {
      await sut.delete(inputId, userRole);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDeletionPermissionValidator.validate).toHaveBeenCalledTimes(
        1,
      );
      expect(mockedInUseValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("performAdditionalValidations", () => {
    const inputId = "military-id-123";
    const sanitizedId = "clean-military-id-123";

    beforeEach(() => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockReturnValue();
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedInUseValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();
    });

    it("should propagate inUseValidator exceptions", async () => {
      const inUseError = new Error("Military is in use");
      mockedInUseValidator.validate.mockRejectedValueOnce(inUseError);

      await expect(sut.delete(inputId)).rejects.toThrow(inUseError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedInUseValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should call inUseValidator with correct parameters", async () => {
      await sut.delete(inputId);

      expect(mockedInUseValidator.validate).toHaveBeenCalledWith(sanitizedId);
    });
  });
});
