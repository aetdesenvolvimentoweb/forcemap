import {
  mockVehicleRepository,
  mockIdSanitizer,
  mockVehicleInputDTOSanitizer,
  mockIdValidator,
  mockVehicleIdRegisteredValidator,
  mockVehicleInputDTOValidator,
} from "../../../../../__mocks__";
import { UpdateVehicleService } from "../../../../../src/application/services/vehicle/update.vehicle.service";
import { VehicleInputDTO } from "../../../../../src/domain/dtos";
import { VehicleSituation } from "../../../../../src/domain/entities";

describe("UpdateVehicleService", () => {
  let sut: UpdateVehicleService;
  let mockRepository = mockVehicleRepository();
  let mockIdSanitizerMock = mockIdSanitizer();
  let mockDataSanitizerMock = mockVehicleInputDTOSanitizer();
  let mockIdValidatorMock = mockIdValidator();
  let mockIdRegisteredValidatorMock = mockVehicleIdRegisteredValidator();
  let mockDataValidatorMock = mockVehicleInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateVehicleService({
      vehicleRepository: mockRepository,
      idSanitizer: mockIdSanitizerMock,
      dataSanitizer: mockDataSanitizerMock,
      idValidator: mockIdValidatorMock,
      idRegisteredValidator: mockIdRegisteredValidatorMock,
      dataValidator: mockDataValidatorMock,
    });
  });

  describe("update", () => {
    const inputId = "test-id-123";
    const sanitizedId = "sanitized-test-id-123";

    const inputData: VehicleInputDTO = {
      name: "VIATURA-001",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento teste",
    };

    const sanitizedData: VehicleInputDTO = {
      name: "VIATURA-001",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento teste",
    };

    describe("successful update", () => {
      it("should update vehicle when all validations pass", async () => {
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockDataSanitizerMock.sanitize.mockReturnValueOnce(sanitizedData);
        mockDataValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockRepository.update.mockResolvedValueOnce(undefined);

        await expect(sut.update(inputId, inputData)).resolves.not.toThrow();

        expect(mockIdSanitizerMock.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockIdValidatorMock.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockIdRegisteredValidatorMock.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockDataSanitizerMock.sanitize).toHaveBeenCalledWith(inputData);
        expect(mockDataValidatorMock.validate).toHaveBeenCalledWith(
          sanitizedData,
          sanitizedId,
        );
        expect(mockRepository.update).toHaveBeenCalledWith(
          sanitizedId,
          sanitizedData,
        );
      });

      it("should call all dependencies in correct order", async () => {
        const callOrder: string[] = [];

        mockIdSanitizerMock.sanitize.mockImplementationOnce((id) => {
          callOrder.push("idSanitize");
          return id;
        });

        mockIdValidatorMock.validate.mockImplementationOnce(() => {
          callOrder.push("idValidate");
        });

        mockIdRegisteredValidatorMock.validate.mockImplementationOnce(
          async () => {
            callOrder.push("idRegisteredValidate");
          },
        );

        mockDataSanitizerMock.sanitize.mockImplementationOnce((data) => {
          callOrder.push("dataSanitize");
          return data;
        });

        mockDataValidatorMock.validate.mockImplementationOnce(async () => {
          callOrder.push("dataValidate");
        });

        mockRepository.update.mockImplementationOnce(async () => {
          callOrder.push("update");
        });

        await sut.update(inputId, inputData);

        expect(callOrder).toEqual([
          "idSanitize",
          "idValidate",
          "idRegisteredValidate",
          "dataSanitize",
          "dataValidate",
          "update",
        ]);
      });
    });

    describe("failed update", () => {
      it("should throw error when id sanitizer throws", async () => {
        const sanitizerError = new Error("ID Sanitizer error");
        mockIdSanitizerMock.sanitize.mockImplementationOnce(() => {
          throw sanitizerError;
        });

        await expect(sut.update(inputId, inputData)).rejects.toThrow(
          sanitizerError,
        );

        expect(mockIdSanitizerMock.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockIdValidatorMock.validate).not.toHaveBeenCalled();
      });

      it("should throw error when id validator throws", async () => {
        const validatorError = new Error("ID Validator error");
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockImplementationOnce(() => {
          throw validatorError;
        });

        await expect(sut.update(inputId, inputData)).rejects.toThrow(
          validatorError,
        );

        expect(mockIdSanitizerMock.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockIdValidatorMock.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockIdRegisteredValidatorMock.validate).not.toHaveBeenCalled();
      });

      it("should throw error when id registered validator throws", async () => {
        const registeredValidatorError = new Error(
          "ID Registered Validator error",
        );
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidatorMock.validate.mockRejectedValueOnce(
          registeredValidatorError,
        );

        await expect(sut.update(inputId, inputData)).rejects.toThrow(
          registeredValidatorError,
        );

        expect(mockIdSanitizerMock.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockIdValidatorMock.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockIdRegisteredValidatorMock.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockDataSanitizerMock.sanitize).not.toHaveBeenCalled();
      });

      it("should throw error when data sanitizer throws", async () => {
        const dataSanitizerError = new Error("Data Sanitizer error");
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockDataSanitizerMock.sanitize.mockImplementationOnce(() => {
          throw dataSanitizerError;
        });

        await expect(sut.update(inputId, inputData)).rejects.toThrow(
          dataSanitizerError,
        );

        expect(mockDataSanitizerMock.sanitize).toHaveBeenCalledWith(inputData);
        expect(mockDataValidatorMock.validate).not.toHaveBeenCalled();
      });

      it("should throw error when data validator throws", async () => {
        const dataValidatorError = new Error("Data Validator error");
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockDataSanitizerMock.sanitize.mockReturnValueOnce(sanitizedData);
        mockDataValidatorMock.validate.mockRejectedValueOnce(
          dataValidatorError,
        );

        await expect(sut.update(inputId, inputData)).rejects.toThrow(
          dataValidatorError,
        );

        expect(mockDataValidatorMock.validate).toHaveBeenCalledWith(
          sanitizedData,
          sanitizedId,
        );
        expect(mockRepository.update).not.toHaveBeenCalled();
      });

      it("should throw error when repository throws", async () => {
        const repositoryError = new Error("Repository error");
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockDataSanitizerMock.sanitize.mockReturnValueOnce(sanitizedData);
        mockDataValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockRepository.update.mockRejectedValueOnce(repositoryError);

        await expect(sut.update(inputId, inputData)).rejects.toThrow(
          repositoryError,
        );

        expect(mockRepository.update).toHaveBeenCalledWith(
          sanitizedId,
          sanitizedData,
        );
      });
    });

    describe("method calls", () => {
      it("should call each dependency exactly once", async () => {
        mockIdSanitizerMock.sanitize.mockReturnValueOnce(sanitizedId);
        mockIdValidatorMock.validate.mockReturnValueOnce(undefined);
        mockIdRegisteredValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockDataSanitizerMock.sanitize.mockReturnValueOnce(sanitizedData);
        mockDataValidatorMock.validate.mockResolvedValueOnce(undefined);
        mockRepository.update.mockResolvedValueOnce(undefined);

        await sut.update(inputId, inputData);

        expect(mockIdSanitizerMock.sanitize).toHaveBeenCalledTimes(1);
        expect(mockIdValidatorMock.validate).toHaveBeenCalledTimes(1);
        expect(mockIdRegisteredValidatorMock.validate).toHaveBeenCalledTimes(1);
        expect(mockDataSanitizerMock.sanitize).toHaveBeenCalledTimes(1);
        expect(mockDataValidatorMock.validate).toHaveBeenCalledTimes(1);
        expect(mockRepository.update).toHaveBeenCalledTimes(1);
      });
    });
  });
});
