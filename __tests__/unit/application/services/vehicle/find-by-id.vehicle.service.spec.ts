import {
  mockIdSanitizer,
  mockIdValidator,
  mockVehicleIdRegisteredValidator,
  mockVehicleRepository,
} from "../../../../../__mocks__";
import { FindByIdVehicleService } from "../../../../../src/application/services/vehicle/find-by-id.vehicle.service";
import { Vehicle, VehicleSituation } from "../../../../../src/domain/entities";

describe("FindByIdVehicleService", () => {
  let sut: FindByIdVehicleService;
  let mockRepository = mockVehicleRepository();
  let mockSanitizer = mockIdSanitizer();
  let mockValidator = mockIdValidator();
  let mockRegisteredValidator = mockVehicleIdRegisteredValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdVehicleService({
      vehicleRepository: mockRepository,
      sanitizer: mockSanitizer,
      idValidator: mockValidator,
      idRegisteredValidator: mockRegisteredValidator,
    });
  });

  describe("findById", () => {
    const inputId = "test-id-123";
    const sanitizedId = "sanitized-test-id-123";
    const mockVehicle: Vehicle = {
      id: sanitizedId,
      name: "VIATURA-001",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento teste",
    };

    describe("successful find", () => {
      it("should return vehicle when found", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.findById.mockResolvedValueOnce(mockVehicle);

        const result = await sut.findById(inputId);

        expect(result).toEqual(mockVehicle);
        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.findById).toHaveBeenCalledWith(sanitizedId);
      });

      it("should return null when vehicle not found", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.findById.mockResolvedValueOnce(null);

        const result = await sut.findById(inputId);

        expect(result).toBeNull();
        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.findById).toHaveBeenCalledWith(sanitizedId);
      });

      it("should call sanitizer, validators and repository in correct order", async () => {
        const callOrder: string[] = [];

        mockSanitizer.sanitize.mockImplementationOnce((id) => {
          callOrder.push("sanitize");
          return id;
        });

        mockValidator.validate.mockImplementationOnce(() => {
          callOrder.push("idValidate");
        });

        mockRegisteredValidator.validate.mockImplementationOnce(async () => {
          callOrder.push("registeredValidate");
        });

        mockRepository.findById.mockImplementationOnce(async () => {
          callOrder.push("findById");
          return mockVehicle;
        });

        await sut.findById(inputId);

        expect(callOrder).toEqual([
          "sanitize",
          "idValidate",
          "registeredValidate",
          "findById",
        ]);
      });
    });

    describe("failed find", () => {
      it("should throw error when sanitizer throws", async () => {
        const sanitizerError = new Error("Sanitizer error");
        mockSanitizer.sanitize.mockImplementationOnce(() => {
          throw sanitizerError;
        });

        await expect(sut.findById(inputId)).rejects.toThrow(sanitizerError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).not.toHaveBeenCalled();
        expect(mockRegisteredValidator.validate).not.toHaveBeenCalled();
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });

      it("should throw error when id validator throws", async () => {
        const validatorError = new Error("ID Validator error");
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockImplementationOnce(() => {
          throw validatorError;
        });

        await expect(sut.findById(inputId)).rejects.toThrow(validatorError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).not.toHaveBeenCalled();
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });

      it("should throw error when registered validator throws", async () => {
        const registeredValidatorError = new Error(
          "Registered Validator error",
        );
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockRejectedValueOnce(
          registeredValidatorError,
        );

        await expect(sut.findById(inputId)).rejects.toThrow(
          registeredValidatorError,
        );

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });

      it("should throw error when repository throws", async () => {
        const repositoryError = new Error("Repository error");
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.findById.mockRejectedValueOnce(repositoryError);

        await expect(sut.findById(inputId)).rejects.toThrow(repositoryError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.findById).toHaveBeenCalledWith(sanitizedId);
      });
    });

    describe("method calls", () => {
      it("should call each dependency exactly once", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.findById.mockResolvedValueOnce(mockVehicle);

        await sut.findById(inputId);

        expect(mockSanitizer.sanitize).toHaveBeenCalledTimes(1);
        expect(mockValidator.validate).toHaveBeenCalledTimes(1);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledTimes(1);
        expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      });
    });
  });
});
