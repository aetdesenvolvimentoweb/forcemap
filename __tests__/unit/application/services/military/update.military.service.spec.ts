import {
  mockIdSanitizer,
  mockIdValidator,
  mockMilitaryIdRegisteredValidator,
  mockMilitaryInputDTOSanitizer,
  mockMilitaryInputDTOValidator,
  mockMilitaryRepository,
} from "../../../../../__mocks__";
import { UpdateMilitaryService } from "../../../../../src/application/services";
import { MilitaryInputDTO } from "../../../../../src/domain/dtos";

describe("UpdateMilitaryService", () => {
  let sut: UpdateMilitaryService;
  let mockedRepository = mockMilitaryRepository();
  let mockedIdSanitizer = mockIdSanitizer();
  let mockedDataSanitizer = mockMilitaryInputDTOSanitizer();
  let mockedIdValidator = mockIdValidator();
  let mockedIdRegisteredValidator = mockMilitaryIdRegisteredValidator();
  let mockedDataValidator = mockMilitaryInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateMilitaryService({
      militaryRepository: mockedRepository,
      idSanitizer: mockedIdSanitizer,
      dataSanitizer: mockedDataSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
      dataValidator: mockedDataValidator,
    });
  });

  describe("update", () => {
    const inputId = "military-id-123";
    const sanitizedId = "clean-military-id-123";

    const inputData: MilitaryInputDTO = {
      militaryRankId: "military-rank-id-1",
      rg: 123456789,
      name: "João Silva",
    };

    const sanitizedData: MilitaryInputDTO = {
      militaryRankId: "military-rank-id-1",
      rg: 123456789,
      name: "João Silva",
    };

    it("should update military successfully with valid data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await expect(sut.update(inputId, inputData)).resolves.not.toThrow();
    });

    it("should call id sanitizer with input id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(inputId);
      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call data sanitizer with input data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(inputData);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call data validator with sanitized data and sanitized id", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
        sanitizedId,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository update with sanitized id and data", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedData,
      );
      expect(mockedRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should execute operations in correct order", async () => {
      const executionOrder: string[] = [];

      mockedIdSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("idSanitize");
        return sanitizedId;
      });

      mockedIdValidator.validate.mockImplementation(() => {
        executionOrder.push("idValidate");
      });

      mockedIdRegisteredValidator.validate.mockImplementation(async () => {
        executionOrder.push("idRegisteredValidate");
      });

      mockedDataSanitizer.sanitize.mockImplementation(() => {
        executionOrder.push("dataSanitize");
        return sanitizedData;
      });

      mockedDataValidator.validate.mockImplementation(async () => {
        executionOrder.push("dataValidate");
      });

      mockedRepository.update.mockImplementation(async () => {
        executionOrder.push("update");
      });

      await sut.update(inputId, inputData);

      expect(executionOrder).toEqual([
        "idSanitize",
        "idValidate",
        "idRegisteredValidate",
        "dataSanitize",
        "dataValidate",
        "update",
      ]);
    });

    it("should use sanitized values for all validations and repository", async () => {
      const differentSanitizedId = "different-clean-id";
      const differentSanitizedData: MilitaryInputDTO = {
        militaryRankId: "clean-rank-id",
        rg: 987654321,
        name: "Clean Name",
      };

      mockedIdSanitizer.sanitize.mockReturnValueOnce(differentSanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(differentSanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, inputData);

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
      const sanitizerError = new Error("ID sanitization failed");

      mockedIdSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.update(inputId, inputData)).rejects.toThrow(
        sanitizerError,
      );

      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate id validator exceptions", async () => {
      const validatorError = new Error("Invalid ID format");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.update(inputId, inputData)).rejects.toThrow(
        validatorError,
      );

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate id registered validator exceptions", async () => {
      const registeredValidatorError = new Error("Military not found");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockRejectedValueOnce(
        registeredValidatorError,
      );

      await expect(sut.update(inputId, inputData)).rejects.toThrow(
        registeredValidatorError,
      );

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).not.toHaveBeenCalled();
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate data sanitizer exceptions", async () => {
      const dataSanitizerError = new Error("Data sanitization failed");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockImplementation(() => {
        throw dataSanitizerError;
      });

      await expect(sut.update(inputId, inputData)).rejects.toThrow(
        dataSanitizerError,
      );

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedDataValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate data validator exceptions", async () => {
      const dataValidatorError = new Error("Data validation failed");

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockRejectedValueOnce(dataValidatorError);

      await expect(sut.update(inputId, inputData)).rejects.toThrow(
        dataValidatorError,
      );

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
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockRejectedValueOnce(repositoryError);

      await expect(sut.update(inputId, inputData)).rejects.toThrow(
        repositoryError,
      );

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.update).toHaveBeenCalledTimes(1);
    });

    it("should not return any value", async () => {
      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      const result = await sut.update(inputId, inputData);

      expect(result).toBeUndefined();
    });

    it("should handle concurrent calls independently", async () => {
      const id1 = "military-id-1";
      const id2 = "military-id-2";
      const data1: MilitaryInputDTO = {
        militaryRankId: "rank-1",
        rg: 111111111,
        name: "João Silva",
      };
      const data2: MilitaryInputDTO = {
        militaryRankId: "rank-2",
        rg: 222222222,
        name: "Maria Santos",
      };

      const sanitizedId1 = "clean-id-1";
      const sanitizedId2 = "clean-id-2";
      const sanitizedData1: MilitaryInputDTO = {
        militaryRankId: "clean-rank-1",
        rg: 111111111,
        name: "João Silva",
      };
      const sanitizedData2: MilitaryInputDTO = {
        militaryRankId: "clean-rank-2",
        rg: 222222222,
        name: "Maria Santos",
      };

      mockedIdSanitizer.sanitize
        .mockReturnValueOnce(sanitizedId1)
        .mockReturnValueOnce(sanitizedId2);

      mockedIdValidator.validate.mockReturnValueOnce().mockReturnValueOnce();

      mockedIdRegisteredValidator.validate
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      mockedDataSanitizer.sanitize
        .mockReturnValueOnce(sanitizedData1)
        .mockReturnValueOnce(sanitizedData2);

      mockedDataValidator.validate
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();

      mockedRepository.update.mockResolvedValueOnce().mockResolvedValueOnce();

      await Promise.all([sut.update(id1, data1), sut.update(id2, data2)]);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledTimes(2);
      expect(mockedDataValidator.validate).toHaveBeenCalledTimes(2);
      expect(mockedRepository.update).toHaveBeenCalledTimes(2);

      expect(mockedIdSanitizer.sanitize).toHaveBeenNthCalledWith(1, id1);
      expect(mockedIdSanitizer.sanitize).toHaveBeenNthCalledWith(2, id2);
      expect(mockedDataSanitizer.sanitize).toHaveBeenNthCalledWith(1, data1);
      expect(mockedDataSanitizer.sanitize).toHaveBeenNthCalledWith(2, data2);
    });

    it("should handle special characters in data", async () => {
      const specialData: MilitaryInputDTO = {
        militaryRankId: "special-rank-id",
        rg: 999999999,
        name: "José da Silva Júnior",
      };

      const sanitizedSpecialData: MilitaryInputDTO = {
        militaryRankId: "special-rank-id",
        rg: 999999999,
        name: "José da Silva Júnior",
      };

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedSpecialData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(inputId, specialData);

      expect(mockedDataSanitizer.sanitize).toHaveBeenCalledWith(specialData);
      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedSpecialData,
        sanitizedId,
      );
      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedId,
        sanitizedSpecialData,
      );
    });

    it("should handle UUID format ids", async () => {
      const uuidId = "550e8400-e29b-41d4-a716-446655440000";
      const sanitizedUuidId = "550e8400-e29b-41d4-a716-446655440000";

      mockedIdSanitizer.sanitize.mockReturnValueOnce(sanitizedUuidId);
      mockedIdValidator.validate.mockReturnValueOnce();
      mockedIdRegisteredValidator.validate.mockResolvedValueOnce();
      mockedDataSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
      mockedDataValidator.validate.mockResolvedValueOnce();
      mockedRepository.update.mockResolvedValueOnce();

      await sut.update(uuidId, inputData);

      expect(mockedIdSanitizer.sanitize).toHaveBeenCalledWith(uuidId);
      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedUuidId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedUuidId,
      );
      expect(mockedDataValidator.validate).toHaveBeenCalledWith(
        sanitizedData,
        sanitizedUuidId,
      );
      expect(mockedRepository.update).toHaveBeenCalledWith(
        sanitizedUuidId,
        sanitizedData,
      );
    });
  });
});
