import {
  mockMilitaryRepository,
  mockUserRepository,
} from "../../../../../__mocks__/repositories";
import { mockIdValidator } from "../../../../../__mocks__/validators";
import {
  DuplicatedKeyError,
  EntityNotFoundError,
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { IdValidatorProtocol } from "../../../../../src/application/protocols";
import { UserInputDTOValidator } from "../../../../../src/application/validators";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import {
  MilitaryRepository,
  UserRepository,
} from "../../../../../src/domain/repositories";

describe("UserInputDTOValidator", () => {
  let sut: UserInputDTOValidator;
  let mockedUserRepository: jest.Mocked<UserRepository>;
  let mockedMilitaryRepository: jest.Mocked<MilitaryRepository>;
  let mockedIdValidator: jest.Mocked<IdValidatorProtocol>;

  const validInputData: UserInputDTO = {
    militaryId: "123e4567-e89b-12d3-a456-426614174000",
    role: UserRole.ADMIN,
    password: "ValidPass@123",
  };

  beforeEach(() => {
    mockedUserRepository = mockUserRepository();
    mockedMilitaryRepository = mockMilitaryRepository();
    mockedIdValidator = mockIdValidator();

    sut = new UserInputDTOValidator({
      userRepository: mockedUserRepository,
      militaryRepository: mockedMilitaryRepository,
      idValidator: mockedIdValidator,
    });

    // Setup default mocks
    mockedMilitaryRepository.findById.mockResolvedValue({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "João Silva",
      rg: 1234,
      militaryRankId: "rank-id",
      militaryRank: {
        id: "rank-id",
        abbreviation: "SD",
        order: 1,
      },
    });
    mockedUserRepository.findByMilitaryId.mockResolvedValue(null);
  });

  describe("constructor", () => {
    it("should create instance with repository and id validator dependencies", () => {
      expect(sut).toBeInstanceOf(UserInputDTOValidator);
      expect(sut.validate).toBeDefined();
    });
  });

  describe("validate", () => {
    it("should validate successfully with valid input data", async () => {
      await expect(sut.validate(validInputData)).resolves.not.toThrow();
    });

    describe("Military ID validation", () => {
      it("should throw MissingParamError when militaryId is null", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          militaryId: null as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Militar"),
        );
      });

      it("should throw MissingParamError when militaryId is undefined", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          militaryId: undefined as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Militar"),
        );
      });

      it("should throw MissingParamError when militaryId is empty string", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          militaryId: "",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Militar"),
        );
      });

      it("should throw EntityNotFoundError when military does not exist", async () => {
        mockedMilitaryRepository.findById.mockResolvedValue(null);

        await expect(sut.validate(validInputData)).rejects.toThrow(
          new EntityNotFoundError("Militar"),
        );
      });
    });

    describe("User role validation", () => {
      it("should throw MissingParamError when role is null", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          role: null as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Função"),
        );
      });

      it("should throw MissingParamError when role is undefined", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          role: undefined as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Função"),
        );
      });

      it("should throw InvalidParamError when role is invalid", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          role: "INVALID_ROLE" as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError("Função", "valor inválido"),
        );
      });

      it("should validate successfully with all valid user roles", async () => {
        for (const role of Object.values(UserRole)) {
          const inputData: UserInputDTO = {
            ...validInputData,
            role,
          };

          await expect(sut.validate(inputData)).resolves.not.toThrow();
        }
      });
    });

    describe("Password validation", () => {
      it("should throw MissingParamError when password is null", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: null as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw MissingParamError when password is undefined", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: undefined as any,
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw MissingParamError when password is empty string", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Senha"),
        );
      });

      it("should throw InvalidParamError when password is shorter than 8 characters", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "Pass@1",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
        );
      });

      it("should throw InvalidParamError when password has no uppercase letter", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "validpass@123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra maiúscula",
          ),
        );
      });

      it("should throw InvalidParamError when password has no lowercase letter", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "VALIDPASS@123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 letra minúscula",
          ),
        );
      });

      it("should throw InvalidParamError when password has no number", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "ValidPass@",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError("Senha", "deve conter pelo menos 1 número"),
        );
      });

      it("should throw InvalidParamError when password has no special character", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "ValidPass123",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError(
            "Senha",
            "deve conter pelo menos 1 caractere especial",
          ),
        );
      });

      it("should validate successfully with all special characters", async () => {
        const specialChars = "!@#$%^&*()_+=[]{}';:\"\\|,.<>/?-";

        for (const char of specialChars) {
          const inputData: UserInputDTO = {
            ...validInputData,
            password: `ValidPass${char}123`,
          };

          await expect(sut.validate(inputData)).resolves.not.toThrow();
        }
      });

      it("should validate successfully with valid password", async () => {
        const validPasswords = [
          "ValidPass@123",
          "MySecure#Pass1",
          "Test$Password9",
          "Strong!Pass123",
        ];

        for (const password of validPasswords) {
          const inputData: UserInputDTO = {
            ...validInputData,
            password,
          };

          await expect(sut.validate(inputData)).resolves.not.toThrow();
        }
      });
    });

    describe("Military ID validation calls", () => {
      it("should call idValidator.validate with militaryId", async () => {
        await sut.validate(validInputData);

        expect(mockedIdValidator.validate).toHaveBeenCalledWith(
          validInputData.militaryId,
        );
      });

      it("should call militaryRepository.findById with militaryId", async () => {
        await sut.validate(validInputData);

        expect(mockedMilitaryRepository.findById).toHaveBeenCalledWith(
          validInputData.militaryId,
        );
      });
    });

    describe("Combined validation", () => {
      it("should throw first validation error when multiple fields are invalid", async () => {
        const inputData: UserInputDTO = {
          militaryId: null as any,
          role: UserRole.ADMIN,
          password: "",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new MissingParamError("Militar"),
        );
      });

      it("should throw password error after other validations pass", async () => {
        const inputData: UserInputDTO = {
          ...validInputData,
          password: "weak",
        };

        await expect(sut.validate(inputData)).rejects.toThrow(
          new InvalidParamError("Senha", "deve ter pelo menos 8 caracteres"),
        );
      });
    });

    describe("Military ID uniqueness validation", () => {
      it("should throw DuplicatedKeyError when military is already used by another user", async () => {
        const existingUser = {
          id: "different-user-id",
          role: UserRole.ADMIN,
          military: {
            id: validInputData.militaryId,
            name: "Another User",
            rg: 9999,
            militaryRankId: "rank-id",
            militaryRank: {
              id: "rank-id",
              abbreviation: "SGT",
              order: 5,
            },
          },
        };

        // Reset the mock to return existing user instead of null
        mockedUserRepository.findByMilitaryId.mockReset();
        mockedUserRepository.findByMilitaryId.mockResolvedValue(existingUser);

        await expect(sut.validate(validInputData)).rejects.toThrow(
          new DuplicatedKeyError("Militar"),
        );
      });
    });

    describe("Update validation with idToIgnore", () => {
      it("should validate successfully when updating existing user", async () => {
        const idToIgnore = "existing-user-id";

        await expect(
          sut.validate(validInputData, idToIgnore),
        ).resolves.not.toThrow();
      });
    });
  });
});
