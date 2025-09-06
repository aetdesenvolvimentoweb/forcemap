import {
  mockMilitaryRepository,
  mockPasswordHasher,
  mockUserCredentialsInputDTOSanitizer,
  mockUserCredentialsInputDTOValidator,
  mockUserRepository,
} from "../../../../../__mocks__";
import { NotAuthorizedError } from "../../../../../src/application/errors";
import { AuthenticateUserService } from "../../../../../src/application/services";
import { UserCredentialsInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../../../src/domain/repositories";

describe("AuthenticateUserService", () => {
  let sut: AuthenticateUserService;
  let mockedMilitaryRepository: jest.Mocked<MilitaryRepository>;
  let mockedUserRepository: jest.Mocked<UserRepository>;
  let mockedSanitizer = mockUserCredentialsInputDTOSanitizer();
  let mockedValidator = mockUserCredentialsInputDTOValidator();
  let mockedPasswordHasher = mockPasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedMilitaryRepository = mockMilitaryRepository();
    mockedUserRepository = mockUserRepository();

    sut = new AuthenticateUserService({
      militaryRepository: mockedMilitaryRepository,
      userRepository: mockedUserRepository,
      sanitizer: mockedSanitizer,
      validator: mockedValidator,
      passwordHasher: mockedPasswordHasher,
    });
  });

  describe("authenticate", () => {
    const inputCredentials: UserCredentialsInputDTO = {
      rg: 1234,
      password: "ValidPass@123",
    };

    const sanitizedCredentials: UserCredentialsInputDTO = {
      rg: 1234,
      password: "ValidPass@123",
    };

    const mockMilitary = {
      id: "military-id-123",
      militaryRankId: "rank-id-123",
      rg: 1234,
      name: "John Doe",
      militaryRank: {
        id: "rank-id-123",
        abbreviation: "Sd",
        order: 1,
      },
    };

    const mockUser = {
      id: "user-id-123",
      militaryId: "military-id-123",
      role: UserRole.BOMBEIRO,
      password: "hashedPassword123",
    };

    beforeEach(() => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedCredentials);
      mockedValidator.validate.mockReturnValue();
    });

    it("should authenticate user successfully with valid credentials", async () => {
      // Arrange
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValue(true);

      // Act
      const result = await sut.authenticate(inputCredentials);

      // Assert
      expect(result).toEqual({
        id: "user-id-123",
        role: UserRole.BOMBEIRO,
        military: "Sd John Doe",
      });

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputCredentials);
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedCredentials,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(1234);
      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith("military-id-123");
      expect(mockedPasswordHasher.compare).toHaveBeenCalledWith(
        "ValidPass@123",
        "hashedPassword123",
      );
    });

    it("should throw NotAuthorizedError when military not found", async () => {
      // Arrange
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);

      // Act & Assert
      await expect(sut.authenticate(inputCredentials)).rejects.toThrow(
        NotAuthorizedError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputCredentials);
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedCredentials,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(1234);
      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).not.toHaveBeenCalled();
      expect(mockedPasswordHasher.compare).not.toHaveBeenCalled();
    });

    it("should throw NotAuthorizedError when user not found", async () => {
      // Arrange
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(sut.authenticate(inputCredentials)).rejects.toThrow(
        NotAuthorizedError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputCredentials);
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedCredentials,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(1234);
      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith("military-id-123");
      expect(mockedPasswordHasher.compare).not.toHaveBeenCalled();
    });

    it("should throw NotAuthorizedError when password is invalid", async () => {
      // Arrange
      mockedMilitaryRepository.findByRg.mockResolvedValue(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(sut.authenticate(inputCredentials)).rejects.toThrow(
        NotAuthorizedError,
      );

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputCredentials);
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedCredentials,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(1234);
      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith("military-id-123");
      expect(mockedPasswordHasher.compare).toHaveBeenCalledWith(
        "ValidPass@123",
        "hashedPassword123",
      );
    });

    it("should call sanitizer and validator with correct parameters", async () => {
      // Arrange
      mockedMilitaryRepository.findByRg.mockResolvedValue(null);

      // Act
      try {
        await sut.authenticate(inputCredentials);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputCredentials);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedValidator.validate).toHaveBeenCalledWith(
        sanitizedCredentials,
      );
    });

    it("should handle military rank abbreviation concatenation correctly", async () => {
      // Arrange
      const mockMilitaryWithoutRank = {
        ...mockMilitary,
        militaryRank: {
          id: "rank-id-456",
          abbreviation: "Cb",
          order: 2,
        },
      };

      mockedMilitaryRepository.findByRg.mockResolvedValue(
        mockMilitaryWithoutRank,
      );
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValue(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValue(true);

      // Act
      const result = await sut.authenticate(inputCredentials);

      // Assert
      expect(result?.military).toBe("Cb John Doe");
    });
  });

  describe("constructor", () => {
    it("should create instance with correct dependencies", () => {
      expect(sut).toBeInstanceOf(AuthenticateUserService);
      expect(sut.authenticate).toBeDefined();
    });
  });
});
