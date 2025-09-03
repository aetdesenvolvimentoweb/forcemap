import {
  mockLoginInputDTOSanitizer,
  mockLoginInputDTOValidator,
  mockMilitaryRepository,
  mockPasswordHasher,
  mockUserRepository,
} from "../../../../../__mocks__";
import { NotAuthorizedError } from "../../../../../src/application/errors";
import { LoginAuthService } from "../../../../../src/application/services";
import { LoginInputDTO, UserLoggedDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("LoginAuthService", () => {
  let sut: LoginAuthService;
  let mockedMilitaryRepository = mockMilitaryRepository();
  let mockedUserRepository = mockUserRepository();
  let mockedSanitizer = mockLoginInputDTOSanitizer();
  let mockedValidator = mockLoginInputDTOValidator();
  let mockedPasswordHasher = mockPasswordHasher();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new LoginAuthService({
      militaryRepository: mockedMilitaryRepository,
      userRepository: mockedUserRepository,
      sanitizer: mockedSanitizer,
      validator: mockedValidator,
      passwordHasher: mockedPasswordHasher,
    });
  });

  describe("login", () => {
    const inputData: LoginInputDTO = {
      rg: 1234,
      password: "ValidPass@123",
    };

    const sanitizedData: LoginInputDTO = {
      rg: 1234,
      password: "ValidPass@123",
    };

    const mockMilitary = {
      id: "military-id-123",
      name: "João Silva",
      rg: 1234,
      militaryRankId: "rank-id",
      militaryRank: {
        id: "rank-id",
        abbreviation: "SGT",
        order: 5,
      },
    };

    const mockUser = {
      id: "user-id-456",
      militaryId: "military-id-123",
      role: UserRole.ADMIN,
      password: "hashed-password",
    };

    const expectedUserLoggedDTO: UserLoggedDTO = {
      id: "user-id-456",
      role: UserRole.ADMIN,
      military: "SGT João Silva",
    };

    it("should login successfully with valid credentials", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      const result = await sut.login(inputData);

      expect(result).toEqual(expectedUserLoggedDTO);
    });

    it("should call sanitizer with input data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      await sut.login(inputData);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call validator with sanitized data", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      await sut.login(inputData);

      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call military repository findByRg with sanitized RG", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      await sut.login(inputData);

      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(
        sanitizedData.rg,
      );
      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledTimes(1);
    });

    it("should call user repository with military ID", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      await sut.login(inputData);

      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith(mockMilitary.id);
      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledTimes(1);
    });

    it("should call password hasher with correct passwords", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      await sut.login(inputData);

      expect(mockedPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.password,
        mockUser.password,
      );
      expect(mockedPasswordHasher.compare).toHaveBeenCalledTimes(1);
    });

    it("should throw error when sanitizer throws", async () => {
      const sanitizerError = new Error("Invalid input format");
      mockedSanitizer.sanitize.mockImplementationOnce(() => {
        throw sanitizerError;
      });

      await expect(sut.login(inputData)).rejects.toThrow(sanitizerError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedValidator.validate).not.toHaveBeenCalled();
      expect(mockedMilitaryRepository.findByRg).not.toHaveBeenCalled();
    });

    it("should throw error when validator throws", async () => {
      const validatorError = new Error("Invalid credentials");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockImplementationOnce(() => {
        throw validatorError;
      });

      await expect(sut.login(inputData)).rejects.toThrow(validatorError);

      expect(mockedValidator.validate).toHaveBeenCalledWith(sanitizedData);
      expect(mockedMilitaryRepository.findByRg).not.toHaveBeenCalled();
    });

    it("should throw NotAuthorizedError when military not found", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(null);

      await expect(sut.login(inputData)).rejects.toThrow(
        new NotAuthorizedError(),
      );

      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(
        sanitizedData.rg,
      );
      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).not.toHaveBeenCalled();
    });

    it("should throw NotAuthorizedError when user not found", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        null,
      );

      await expect(sut.login(inputData)).rejects.toThrow(
        new NotAuthorizedError(),
      );

      expect(
        mockedUserRepository.findByMilitaryIdWithPassword,
      ).toHaveBeenCalledWith(mockMilitary.id);
      expect(mockedPasswordHasher.compare).not.toHaveBeenCalled();
    });

    it("should throw NotAuthorizedError when password is incorrect", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(false);

      await expect(sut.login(inputData)).rejects.toThrow(
        new NotAuthorizedError(),
      );

      expect(mockedPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.password,
        mockUser.password,
      );
    });

    it("should handle different user roles", async () => {
      for (const role of Object.values(UserRole)) {
        const userWithRole = {
          ...mockUser,
          role,
        };

        const expectedResult: UserLoggedDTO = {
          id: userWithRole.id,
          role,
          military: "SGT João Silva",
        };

        mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
        mockedValidator.validate.mockReturnValueOnce();
        mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
        mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
          userWithRole,
        );
        mockedPasswordHasher.compare.mockResolvedValueOnce(true);

        const result = await sut.login(inputData);

        expect(result).toEqual(expectedResult);
        expect(result.role).toBe(role);
      }
    });

    it("should throw error when password hasher throws", async () => {
      const passwordHasherError = new Error("Hashing service unavailable");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockRejectedValueOnce(passwordHasherError);

      await expect(sut.login(inputData)).rejects.toThrow(passwordHasherError);

      expect(mockedPasswordHasher.compare).toHaveBeenCalledWith(
        sanitizedData.password,
        mockUser.password,
      );
    });

    it("should handle async operations correctly", async () => {
      let resolveMilitary: (value: typeof mockMilitary) => void;
      let resolveUser: (value: typeof mockUser) => void;
      let resolvePasswordCheck: (value: boolean) => void;

      const militaryPromise = new Promise<typeof mockMilitary>((resolve) => {
        resolveMilitary = resolve;
      });
      const userPromise = new Promise<typeof mockUser>((resolve) => {
        resolveUser = resolve;
      });
      const passwordPromise = new Promise<boolean>((resolve) => {
        resolvePasswordCheck = resolve;
      });

      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockReturnValueOnce(militaryPromise);
      mockedUserRepository.findByMilitaryIdWithPassword.mockReturnValueOnce(
        userPromise,
      );
      mockedPasswordHasher.compare.mockReturnValueOnce(passwordPromise);

      const loginPromise = sut.login(inputData);

      // Should not resolve immediately
      let isResolved = false;
      loginPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);

      // Resolve in sequence
      resolveMilitary!(mockMilitary);
      await new Promise((resolve) => setTimeout(resolve, 10));

      resolveUser!(mockUser);
      await new Promise((resolve) => setTimeout(resolve, 10));

      resolvePasswordCheck!(true);

      const result = await loginPromise;
      expect(result).toEqual(expectedUserLoggedDTO);
    });

    it("should not expose user password in result", async () => {
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockResolvedValueOnce(mockMilitary);
      mockedUserRepository.findByMilitaryIdWithPassword.mockResolvedValueOnce(
        mockUser,
      );
      mockedPasswordHasher.compare.mockResolvedValueOnce(true);

      const result = await sut.login(inputData);

      expect(result).not.toHaveProperty("password");
      expect(result).not.toHaveProperty("militaryId");
      expect(result.military).toBe("SGT João Silva"); // Should be military rank + name, not ID
    });

    it("should handle repository errors gracefully", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedValidator.validate.mockReturnValueOnce();
      mockedMilitaryRepository.findByRg.mockRejectedValueOnce(repositoryError);

      await expect(sut.login(inputData)).rejects.toThrow(repositoryError);

      expect(mockedMilitaryRepository.findByRg).toHaveBeenCalledWith(
        sanitizedData.rg,
      );
    });
  });
});
