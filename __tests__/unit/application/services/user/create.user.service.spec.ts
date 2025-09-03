import {
  mockPasswordHasher,
  mockUserInputDTOSanitizer,
  mockUserInputDTOValidator,
  mockUserRepository,
} from "../../../../../__mocks__";
import { CreateUserService } from "../../../../../src/application/services";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("CreateUserService", () => {
  let sut: CreateUserService;
  let mockedRepository = mockUserRepository();
  let mockedSanitizer = mockUserInputDTOSanitizer();
  let mockedValidator = mockUserInputDTOValidator();
  let mockedPasswordHasher = mockPasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateUserService({
      userRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      validator: mockedValidator,
      passwordHasher: mockedPasswordHasher,
    });
  });

  describe("create", () => {
    const inputData: UserInputDTO = {
      militaryId: "123e4567-e89b-12d3-a456-426614174000",
      role: UserRole.ADMIN,
      password: "ValidPass@123",
    };

    const sanitizedData: UserInputDTO = {
      militaryId: "123e4567-e89b-12d3-a456-426614174000",
      role: UserRole.ADMIN,
      password: "ValidPass@123",
    };

    const hashedPassword = "$2b$10$hashedPasswordExample";
    const userDataWithHashedPassword = {
      militaryId: "123e4567-e89b-12d3-a456-426614174000",
      role: UserRole.ADMIN,
      password: hashedPassword,
    };

    it("should create user successfully with valid data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      await expect(sut.create(inputData)).resolves.not.toThrow();
    });

    it("should call sanitizer with input data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call validator with sanitized data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call password hasher with plain password", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.password,
      );
      expect(mockedPasswordHasher.hash).toHaveBeenCalledTimes(1);
    });

    it("should call repository create with hashed password", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedRepository.create).toHaveBeenCalledWith(
        userDataWithHashedPassword,
      );
      expect(mockedRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should call all dependencies exactly once", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(inputData);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledTimes(1);
      expect(mockedRepository.create).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sanitizer throws", async () => {
      const sanitizerError = new Error("Sanitizer error");
      mockedSanitizer.sanitize.mockImplementationOnce(() => {
        throw sanitizerError;
      });

      await expect(sut.create(inputData)).rejects.toThrow(sanitizerError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedValidator.validate).not.toHaveBeenCalled();
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when validator throws", async () => {
      const validatorError = new Error("Validator error");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockRejectedValueOnce(validatorError);

      await expect(sut.create(inputData)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error when repository throws", async () => {
      const repositoryError = new Error("Repository error");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockRejectedValueOnce(repositoryError);

      await expect(sut.create(inputData)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.password,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        userDataWithHashedPassword,
      );
    });

    it("should handle different user roles", async () => {
      for (const role of Object.values(UserRole)) {
        const testData: UserInputDTO = {
          ...inputData,
          role,
        };

        const testSanitizedData: UserInputDTO = {
          ...sanitizedData,
          role,
        };

        mockedSanitizer.sanitize.mockReturnValueOnce(testSanitizedData);
        mockedValidator.validate.mockResolvedValueOnce();
        mockedPasswordHasher.hash.mockResolvedValueOnce(
          `hashed_${role}_password`,
        );
        mockedRepository.create.mockResolvedValueOnce();

        await expect(sut.create(testData)).resolves.not.toThrow();

        const expectedHashedData = {
          ...testSanitizedData,
          password: `hashed_${role}_password`,
        };

        expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(testData);
        expect(mockedValidator.validate).toHaveBeenCalledWith(
          testSanitizedData,
        );
        expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
          testSanitizedData.password,
        );
        expect(mockedRepository.create).toHaveBeenCalledWith(
          expectedHashedData,
        );
      }

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
      expect(mockedValidator.validate).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
      expect(mockedPasswordHasher.hash).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
      expect(mockedRepository.create).toHaveBeenCalledTimes(
        Object.values(UserRole).length,
      );
    });

    it("should handle empty password after sanitization", async () => {
      const emptyPasswordData: UserInputDTO = {
        ...sanitizedData,
        password: "",
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(emptyPasswordData);
      const validationError = new Error("Password cannot be empty");
      mockedValidator.validate.mockRejectedValueOnce(validationError);

      await expect(sut.create(inputData)).rejects.toThrow(validationError);

      expect(mockedValidator.validate).toHaveBeenCalledWith(emptyPasswordData);
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should handle null military ID after sanitization", async () => {
      const nullMilitaryIdData: UserInputDTO = {
        ...sanitizedData,
        militaryId: null as any,
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(nullMilitaryIdData);
      const validationError = new Error("Military ID cannot be null");
      mockedValidator.validate.mockRejectedValueOnce(validationError);

      await expect(sut.create(inputData)).rejects.toThrow(validationError);

      expect(mockedValidator.validate).toHaveBeenCalledWith(nullMilitaryIdData);
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should preserve original input data structure", async () => {
      const complexInputData: UserInputDTO = {
        militaryId: "complex-military-id-123",
        role: UserRole.CHEFE,
        password: "ComplexPassword@456",
      };

      mockedSanitizer.sanitize.mockReturnValueOnce(complexInputData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockResolvedValueOnce(
        "hashed_complex_password",
      );
      mockedRepository.create.mockResolvedValueOnce();

      await sut.create(complexInputData);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(complexInputData);
    });

    it("should handle async validation", async () => {
      let resolveValidation: () => void;
      const validationPromise = new Promise<void>((resolve) => {
        resolveValidation = resolve;
      });

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce(validationPromise);
      mockedPasswordHasher.hash.mockResolvedValueOnce(hashedPassword);
      mockedRepository.create.mockResolvedValueOnce();

      const createPromise = sut.create(inputData);

      // Validation should not complete immediately
      let isResolved = false;
      createPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);
      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();

      // Now resolve the validation
      resolveValidation!();

      await expect(createPromise).resolves.not.toThrow();
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.password,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith(
        userDataWithHashedPassword,
      );
    });

    it("should throw error when password hasher throws", async () => {
      const passwordHasherError = new Error("Password hashing failed");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockResolvedValueOnce();
      mockedPasswordHasher.hash.mockRejectedValueOnce(passwordHasherError);

      await expect(sut.create(inputData)).rejects.toThrow(passwordHasherError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        sanitizedData.password,
      );
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should handle password hashing with different passwords", async () => {
      const password1 = "Password1@123";
      const password2 = "Password2@456";
      const hashedPassword1 = "$2b$10$hashedPassword1";
      const hashedPassword2 = "$2b$10$hashedPassword2";

      const inputData1: UserInputDTO = { ...inputData, password: password1 };
      const inputData2: UserInputDTO = { ...inputData, password: password2 };
      const sanitizedData1: UserInputDTO = {
        ...sanitizedData,
        password: password1,
      };
      const sanitizedData2: UserInputDTO = {
        ...sanitizedData,
        password: password2,
      };

      mockedSanitizer.sanitize
        .mockReturnValueOnce(sanitizedData1)
        .mockReturnValueOnce(sanitizedData2);
      mockedValidator.validate.mockResolvedValue();
      mockedPasswordHasher.hash
        .mockResolvedValueOnce(hashedPassword1)
        .mockResolvedValueOnce(hashedPassword2);
      mockedRepository.create.mockResolvedValue();

      await sut.create(inputData1);
      await sut.create(inputData2);

      expect(mockedPasswordHasher.hash).toHaveBeenNthCalledWith(1, password1);
      expect(mockedPasswordHasher.hash).toHaveBeenNthCalledWith(2, password2);
      expect(mockedRepository.create).toHaveBeenNthCalledWith(1, {
        ...sanitizedData1,
        password: hashedPassword1,
      });
      expect(mockedRepository.create).toHaveBeenNthCalledWith(2, {
        ...sanitizedData2,
        password: hashedPassword2,
      });
    });

    it("should ensure password is hashed before validation completes", async () => {
      const callOrder: string[] = [];

      mockedSanitizer.sanitize.mockImplementationOnce((data) => {
        callOrder.push("sanitize");
        return data;
      });
      mockedValidator.validate.mockImplementationOnce(async () => {
        callOrder.push("validate");
      });
      mockedPasswordHasher.hash.mockImplementationOnce(async (password) => {
        callOrder.push("hash");
        return "hashed_" + password;
      });
      mockedRepository.create.mockImplementationOnce(async () => {
        callOrder.push("create");
      });

      await sut.create(inputData);

      expect(callOrder).toEqual(["sanitize", "validate", "hash", "create"]);
    });
  });
});
