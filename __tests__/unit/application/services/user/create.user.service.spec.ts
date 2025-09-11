import {
  mockPasswordHasher,
  mockUserRepository,
} from "../../../../../__mocks__";
import {
  UserInputDTOSanitizerProtocol,
  UserInputDTOValidatorProtocol,
} from "../../../../../src/application/protocols";
import { CreateUserService } from "../../../../../src/application/services";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("CreateUserService", () => {
  let sut: CreateUserService;
  let mockedRepository = mockUserRepository();
  let mockedUserInputDTOValidator: jest.Mocked<UserInputDTOValidatorProtocol>;
  let mockedUserInputDTOSanitizer: jest.Mocked<UserInputDTOSanitizerProtocol>;
  let mockedPasswordHasher = mockPasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUserInputDTOValidator = {
      validate: jest.fn(),
    } as any;

    mockedUserInputDTOSanitizer = {
      sanitize: jest.fn(),
    } as any;

    sut = new CreateUserService({
      repository: mockedRepository,
      userInputDTOValidator: mockedUserInputDTOValidator,
      userInputDTOSanitizer: mockedUserInputDTOSanitizer,
      passwordHasher: mockedPasswordHasher,
    } as any);
  });

  describe("create", () => {
    const mockUserInput: UserInputDTO = {
      militaryId: "military-id-123",
      role: UserRole.BOMBEIRO,
      password: "strongPassword123!@#",
    };

    const mockSanitizedData: UserInputDTO = {
      militaryId: "sanitized-military-id-123",
      role: UserRole.BOMBEIRO,
      password: "strongPassword123!@#",
    };

    const hashedPassword = "hashedPassword123!@#";

    it("should create user successfully with all steps", async () => {
      mockedUserInputDTOSanitizer.sanitize.mockReturnValue(mockSanitizedData);
      mockedUserInputDTOValidator.validate.mockResolvedValue(undefined);
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput);

      expect(mockedUserInputDTOSanitizer.sanitize).toHaveBeenCalledWith(
        mockUserInput,
      );
      expect(mockedUserInputDTOValidator.validate).toHaveBeenCalledWith(
        mockSanitizedData,
        undefined,
      );
      expect(mockedPasswordHasher.hash).toHaveBeenCalledWith(
        mockSanitizedData.password,
      );
      expect(mockedRepository.create).toHaveBeenCalledWith({
        ...mockSanitizedData,
        password: hashedPassword,
      });
    });

    it("should create user with requesting user role", async () => {
      const requestingUserRole = UserRole.ADMIN;

      mockedUserInputDTOSanitizer.sanitize.mockReturnValue(mockSanitizedData);
      mockedUserInputDTOValidator.validate.mockResolvedValue(undefined);
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockResolvedValue(undefined);

      await sut.create(mockUserInput, requestingUserRole);

      expect(mockedUserInputDTOValidator.validate).toHaveBeenCalledWith(
        mockSanitizedData,
        requestingUserRole,
      );
    });

    it("should throw error if validation fails", async () => {
      const validationError = new Error("Validation failed");

      mockedUserInputDTOSanitizer.sanitize.mockReturnValue(mockSanitizedData);
      mockedUserInputDTOValidator.validate.mockRejectedValue(validationError);

      await expect(sut.create(mockUserInput)).rejects.toThrow(validationError);

      expect(mockedPasswordHasher.hash).not.toHaveBeenCalled();
      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if password hashing fails", async () => {
      const hashError = new Error("Hash failed");

      mockedUserInputDTOSanitizer.sanitize.mockReturnValue(mockSanitizedData);
      mockedUserInputDTOValidator.validate.mockResolvedValue(undefined);
      mockedPasswordHasher.hash.mockRejectedValue(hashError);

      await expect(sut.create(mockUserInput)).rejects.toThrow(hashError);

      expect(mockedRepository.create).not.toHaveBeenCalled();
    });

    it("should throw error if repository fails", async () => {
      const repositoryError = new Error("Repository failed");

      mockedUserInputDTOSanitizer.sanitize.mockReturnValue(mockSanitizedData);
      mockedUserInputDTOValidator.validate.mockResolvedValue(undefined);
      mockedPasswordHasher.hash.mockResolvedValue(hashedPassword);
      mockedRepository.create.mockRejectedValue(repositoryError);

      await expect(sut.create(mockUserInput)).rejects.toThrow(repositoryError);
    });
  });
});
