import { mockMilitaryRankRepository } from "../../../../../__mocks__";
import {
  DuplicatedKeyError,
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { MilitaryRankInputDTOValidator } from "../../../../../src/application/validators";
import { MilitaryRankInputDTO } from "../../../../../src/domain/dtos";
import { MilitaryRank } from "../../../../../src/domain/entities";

describe("MilitaryRankInputDTOValidator", () => {
  let sut: MilitaryRankInputDTOValidator;
  let mockedMilitaryRankRepository = mockMilitaryRankRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new MilitaryRankInputDTOValidator({
      militaryRankRepository: mockedMilitaryRankRepository,
    });
  });

  describe("validate", () => {
    const validData: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    describe("successful validation", () => {
      it("should not throw when all data is valid and unique", async () => {
        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(null);

        await expect(sut.validate(validData)).resolves.not.toThrow();
      });

      it("should validate abbreviation with special characters", async () => {
        const dataWithSpecialChars: MilitaryRankInputDTO = {
          abbreviation: "1º SGT",
          order: 5,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(null);

        await expect(sut.validate(dataWithSpecialChars)).resolves.not.toThrow();
      });

      it("should validate minimum values", async () => {
        const minData: MilitaryRankInputDTO = {
          abbreviation: "A",
          order: 1,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(null);

        await expect(sut.validate(minData)).resolves.not.toThrow();
      });

      it("should validate maximum values", async () => {
        const maxData: MilitaryRankInputDTO = {
          abbreviation: "1234567890", // 10 characters
          order: 20,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(null);

        await expect(sut.validate(maxData)).resolves.not.toThrow();
      });
    });

    describe("presence validation", () => {
      it("should throw MissingParamError when abbreviation is null", async () => {
        const dataWithNullAbbreviation = {
          abbreviation: null as any,
          order: 10,
        };

        await expect(sut.validate(dataWithNullAbbreviation)).rejects.toThrow(
          new MissingParamError("Abreviatura"),
        );
      });

      it("should throw MissingParamError when abbreviation is undefined", async () => {
        const dataWithUndefinedAbbreviation = {
          abbreviation: undefined as any,
          order: 10,
        };

        await expect(
          sut.validate(dataWithUndefinedAbbreviation),
        ).rejects.toThrow(new MissingParamError("Abreviatura"));
      });

      it("should throw MissingParamError when abbreviation is empty string", async () => {
        const dataWithEmptyAbbreviation: MilitaryRankInputDTO = {
          abbreviation: "",
          order: 10,
        };

        await expect(sut.validate(dataWithEmptyAbbreviation)).rejects.toThrow(
          new MissingParamError("Abreviatura"),
        );
      });

      it("should throw MissingParamError when abbreviation is only whitespace", async () => {
        const dataWithWhitespaceAbbreviation: MilitaryRankInputDTO = {
          abbreviation: "   ",
          order: 10,
        };

        await expect(
          sut.validate(dataWithWhitespaceAbbreviation),
        ).rejects.toThrow(new MissingParamError("Abreviatura"));
      });

      it("should throw MissingParamError when order is null", async () => {
        const dataWithNullOrder = {
          abbreviation: "CEL",
          order: null as any,
        };

        await expect(sut.validate(dataWithNullOrder)).rejects.toThrow(
          new MissingParamError("Ordem"),
        );
      });

      it("should throw MissingParamError when order is undefined", async () => {
        const dataWithUndefinedOrder = {
          abbreviation: "CEL",
          order: undefined as any,
        };

        await expect(sut.validate(dataWithUndefinedOrder)).rejects.toThrow(
          new MissingParamError("Ordem"),
        );
      });
    });

    describe("abbreviation format validation", () => {
      it("should throw InvalidParamError when abbreviation exceeds max length", async () => {
        const dataWithLongAbbreviation: MilitaryRankInputDTO = {
          abbreviation: "12345678901", // 11 characters
          order: 10,
        };

        await expect(sut.validate(dataWithLongAbbreviation)).rejects.toThrow(
          new InvalidParamError(
            "Abreviatura",
            "não pode exceder 10 caracteres",
          ),
        );
      });

      it("should throw InvalidParamError when abbreviation contains invalid characters", async () => {
        const dataWithInvalidChars: MilitaryRankInputDTO = {
          abbreviation: "CEL@#$",
          order: 10,
        };

        await expect(sut.validate(dataWithInvalidChars)).rejects.toThrow(
          new InvalidParamError(
            "Abreviatura",
            "deve conter apenas letras, números, espaços e/ou os caracteres ordinais (ºª)",
          ),
        );
      });

      it("should throw InvalidParamError when abbreviation contains special symbols", async () => {
        const dataWithSymbols: MilitaryRankInputDTO = {
          abbreviation: "CEL-MAJ",
          order: 10,
        };

        await expect(sut.validate(dataWithSymbols)).rejects.toThrow(
          new InvalidParamError(
            "Abreviatura",
            "deve conter apenas letras, números, espaços e/ou os caracteres ordinais (ºª)",
          ),
        );
      });
    });

    describe("order range validation", () => {
      it("should throw InvalidParamError when order is not integer", async () => {
        const dataWithFloatOrder: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: 10.5,
        };

        await expect(sut.validate(dataWithFloatOrder)).rejects.toThrow(
          new InvalidParamError("Ordem", "deve ser um número inteiro"),
        );
      });

      it("should throw InvalidParamError when order is below minimum", async () => {
        const dataWithLowOrder: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: 0,
        };

        await expect(sut.validate(dataWithLowOrder)).rejects.toThrow(
          new InvalidParamError("Ordem", "deve ser maior que 0"),
        );
      });

      it("should throw InvalidParamError when order is above maximum", async () => {
        const dataWithHighOrder: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: 21,
        };

        await expect(sut.validate(dataWithHighOrder)).rejects.toThrow(
          new InvalidParamError("Ordem", "deve ser menor que 20"),
        );
      });

      it("should throw InvalidParamError when order is NaN", async () => {
        const dataWithNaNOrder: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: NaN,
        };

        await expect(sut.validate(dataWithNaNOrder)).rejects.toThrow(
          new InvalidParamError("Ordem", "deve ser um número inteiro"),
        );
      });
    });

    describe("uniqueness validation", () => {
      it("should throw DuplicatedKeyError when abbreviation already exists", async () => {
        const existingMilitaryRank: MilitaryRank = {
          id: "existing-id",
          abbreviation: "CEL",
          order: 5,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          existingMilitaryRank,
        );

        await expect(sut.validate(validData)).rejects.toThrow(
          new DuplicatedKeyError("Abreviatura"),
        );
      });

      it("should throw DuplicatedKeyError when order already exists", async () => {
        const existingMilitaryRank: MilitaryRank = {
          id: "existing-id",
          abbreviation: "MAJ",
          order: 10,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(
          existingMilitaryRank,
        );

        await expect(sut.validate(validData)).rejects.toThrow(
          new DuplicatedKeyError("Ordem"),
        );
      });

      it("should not throw when abbreviation exists but belongs to ignored id", async () => {
        const existingMilitaryRank: MilitaryRank = {
          id: "ignored-id",
          abbreviation: "CEL",
          order: 5,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          existingMilitaryRank,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(null);

        await expect(
          sut.validate(validData, "ignored-id"),
        ).resolves.not.toThrow();
      });

      it("should not throw when order exists but belongs to ignored id", async () => {
        const existingMilitaryRank: MilitaryRank = {
          id: "ignored-id",
          abbreviation: "MAJ",
          order: 10,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(
          existingMilitaryRank,
        );

        await expect(
          sut.validate(validData, "ignored-id"),
        ).resolves.not.toThrow();
      });

      it("should throw when abbreviation exists and belongs to different id", async () => {
        const existingMilitaryRank: MilitaryRank = {
          id: "different-id",
          abbreviation: "CEL",
          order: 5,
        };

        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          existingMilitaryRank,
        );

        await expect(sut.validate(validData, "ignored-id")).rejects.toThrow(
          new DuplicatedKeyError("Abreviatura"),
        );
      });
    });

    describe("repository interaction", () => {
      it("should call repository methods with correct parameters", async () => {
        mockedMilitaryRankRepository.findByAbbreviation.mockResolvedValueOnce(
          null,
        );
        mockedMilitaryRankRepository.findByOrder.mockResolvedValueOnce(null);

        await sut.validate(validData);

        expect(
          mockedMilitaryRankRepository.findByAbbreviation,
        ).toHaveBeenCalledWith("CEL");
        expect(mockedMilitaryRankRepository.findByOrder).toHaveBeenCalledWith(
          10,
        );
        expect(
          mockedMilitaryRankRepository.findByAbbreviation,
        ).toHaveBeenCalledTimes(1);
        expect(mockedMilitaryRankRepository.findByOrder).toHaveBeenCalledTimes(
          1,
        );
      });

      it("should propagate repository errors", async () => {
        const repositoryError = new Error("Database connection failed");

        mockedMilitaryRankRepository.findByAbbreviation.mockRejectedValueOnce(
          repositoryError,
        );

        await expect(sut.validate(validData)).rejects.toThrow(repositoryError);
      });
    });

    describe("validation order", () => {
      it("should validate presence before format", async () => {
        const invalidData: MilitaryRankInputDTO = {
          abbreviation: "",
          order: 10,
        };

        // Should throw MissingParamError, not format error
        await expect(sut.validate(invalidData)).rejects.toThrow(
          new MissingParamError("Abreviatura"),
        );

        // Repository should not be called for uniqueness validation
        expect(
          mockedMilitaryRankRepository.findByAbbreviation,
        ).not.toHaveBeenCalled();
        expect(mockedMilitaryRankRepository.findByOrder).not.toHaveBeenCalled();
      });

      it("should validate format before uniqueness", async () => {
        const invalidData: MilitaryRankInputDTO = {
          abbreviation: "@CHARS", // Invalid chars but within length limit
          order: 10,
        };

        // Should throw InvalidParamError, not call repository
        await expect(sut.validate(invalidData)).rejects.toThrow(
          new InvalidParamError(
            "Abreviatura",
            "deve conter apenas letras, números, espaços e/ou os caracteres ordinais (ºª)",
          ),
        );

        // Repository should not be called for uniqueness validation
        expect(
          mockedMilitaryRankRepository.findByAbbreviation,
        ).not.toHaveBeenCalled();
        expect(mockedMilitaryRankRepository.findByOrder).not.toHaveBeenCalled();
      });
    });
  });
});
