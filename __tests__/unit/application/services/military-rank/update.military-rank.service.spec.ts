import {
  mockMilitaryRankRepository,
  mockIdSanitizer,
  mockMilitaryRankInputDTOSanitizer,
  mockIdValidator,
  mockMilitaryRankIdRegisteredValidator,
  mockMilitaryRankInputDTOValidator,
} from "../../../../../__mocks__";
import { UpdateMilitaryRankService } from "../../../../../src/application/services";
import { MilitaryRankInputDTO } from "../../../../../src/domain/dtos";

describe("UpdateMilitaryRankService", () => {
  let sut: UpdateMilitaryRankService;
  let mockedRepository = mockMilitaryRankRepository();
  let mockedIdSanitizer = mockIdSanitizer();
  let mockedDataSanitizer = mockMilitaryRankInputDTOSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockMilitaryRankIdRegisteredValidator();
  let mockedDataValidator = mockMilitaryRankInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateMilitaryRankService({
      militaryRankRepository: mockedRepository,
      idSanitizer: mockedIdSanitizer,
      dataSanitizer: mockedDataSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
      dataValidator: mockedDataValidator,
    });
  });

  describe("update", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    const inputData: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };
    const sanitizedId = "sanitized-id";
    const sanitizedData: MilitaryRankInputDTO = {
      abbreviation: "CEL",
      order: 10,
    };

    it("should update military rank successfully with valid data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await expect(sut.update(id, inputData)).resolves.not.toThrow();
    });

    it("should call id sanitizer with provided id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(id);
      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call data sanitizer with input data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call data validator with sanitized data and sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
        sanitizedId,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository update with sanitized id and sanitized data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockedRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should execute operations in correct order", async () => {
      const executionOrder: string[] = [];

      mockedIdSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("id-sanitize");
        return sanitizedId;
      });

      mockedIdValidator.validate.mockImplementation(() => {
        executionOrder.push("id-validate");
      });

      mockedIdRegisteredValidator.validate.mockImplementation(async () => {
        executionOrder.push("id-registered-validate");
      });

      mockedDataSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("data-sanitize");
        return sanitizedData;
      });

      mockedDataValidator.validate.mockImplementation(async () => {
        executionOrder.push("data-validate");
      });

      mockedRepository.update.mockImplementation(async () => {
        executionOrder.push("update");
      });

      await sut.update(id, inputData);

      expect(executionOrder).toEqual([
        "id-sanitize",
        "id-validate",
        "id-registered-validate",
        "data-sanitize",
        "data-validate",
        "update",
      ]);
    });

    it("should use sanitized values throughout the process", async () => {
      const differentSanitizedId = "different-sanitized-id";
      const differentSanitizedData: MilitaryRankInputDTO = {
        abbreviation: "CLEAN",
        order: 15,
      };

      mockedIdSanitizer.sanitize.mockReturnValueOnce(differentSanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(differentSanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputData);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        differentSanitizedData,
        differentSanitizedId,
      );
      expect(mockedRepository.update).toHaveBeenCalledWith(
        differentSanitizedId,
        differentSanitizedData,
      );
    });

    it("should propagate id sanitizer exceptions", async () => {
      const sanitizerError = new Error("Id sanitization failed");

      mockedIdSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.update(id, inputData)).rejects.toThrow(sanitizerError);

      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate id validator exceptions", async () => {
      const validatorError = new Error("Id validation failed");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.update(id, inputData)).rejects.toThrow(validatorError);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate id registered validator exceptions", async () => {
      const validatorError = new Error("Id not registered");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.update(id, inputData)).rejects.toThrow(validatorError);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate data sanitizer exceptions", async () => {
      const sanitizerError = new Error("Data sanitization failed");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.update(id, inputData)).rejects.toThrow(sanitizerError);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate data validator exceptions", async () => {
      const validatorError = new Error("Data validation failed");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockRejectedValueOnce(validatorError);

      await expect(sut.update(id, inputData)).rejects.toThrow(validatorError);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockRejectedValueOnce(repositoryError);

      await expect(sut.update(id, inputData)).rejects.toThrow(repositoryError);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should handle special characters in abbreviation", async () => {
      const inputWithSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      const sanitizedSpecialChars: MilitaryRankInputDTO = {
        abbreviation: "1º SGT",
        order: 5,
      };

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedSpecialChars);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputWithSpecialChars);

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(
        inputWithSpecialChars,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedSpecialChars,
        sanitizedId,
      );
      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedSpecialChars,
      );
    });

    it("should handle zero order value", async () => {
      const inputWithZeroOrder: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 0,
      };

      const sanitizedZeroOrder: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 0,
      };

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedZeroOrder);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(id, inputWithZeroOrder);

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(
        inputWithZeroOrder,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedZeroOrder,
        sanitizedId,
      );
      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedZeroOrder,
      );
    });

    it("should not return any value", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      const result = await sut.update(id, inputData);

      expect(result).toBeUndefined();
    });

    it("should handle concurrent calls independently", async () => {
      const id1 = "id-1";
      const id2 = "id-2";
      const data1: MilitaryRankInputDTO = { abbreviation: "CEL", order: 10 };
      const data2: MilitaryRankInputDTO = { abbreviation: "MAJ", order: 8 };

      const sanitizedId1 = "sanitized-id-1";
      const sanitizedId2 = "sanitized-id-2";
      const sanitizedData1: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 10,
      };
      const sanitizedData2: MilitaryRankInputDTO = {
        abbreviation: "MAJ",
        order: 8,
      };

      mockedIdSanitizer.sanitize
        .mockReturnValueOnce(sanitizedId1)
        .mockReturnValueOnce(sanitizedId2);

      mockedIdValidator.validate.mockReturnValue();
      mockedIdRegisteredValidator.validate.mockResolvedValue();

      mockedDataSanitizer.sanitize
        .mockReturnValueOnce(sanitizedData1)
        .mockReturnValueOnce(sanitizedData2);

      mockedDataValidator.validate.mockResolvedValue();
      mockedRepository.update.mockResolvedValue();

      await Promise.all([sut.update(id1, data1), sut.update(id2, data2)]);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedRepository.update).toHaveBeenCalledTimes(2);

      expect(mockedIdSanitizer.sanitize).toHaveBeenNthCalledWith(1, id1);
      expect(mockedIdSanitizer.sanitize).toHaveBeenNthCalledWith(2, id2);
    });
  });
});
