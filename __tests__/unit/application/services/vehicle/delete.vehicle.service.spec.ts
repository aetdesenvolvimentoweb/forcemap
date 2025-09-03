import {
  mockIdSanitizer,
  mockIdValidator,
  mockVehicleIdRegisteredValidator,
  mockVehicleRepository,
} from "../../../../../__mocks__";
import { DeleteVehicleService } from "../../../../../src/application/services/vehicle/delete.vehicle.service";

describe("DeleteVehicleService", () => {
  let sut: DeleteVehicleService;
  let mockRepository = mockVehicleRepository();
  let mockSanitizer = mockIdSanitizer();
  let mockValidator = mockIdValidator();
  let mockRegisteredValidator = mockVehicleIdRegisteredValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new DeleteVehicleService({
      vehicleRepository: mockRepository,
      sanitizer: mockSanitizer,
      idValidator: mockValidator,
      idRegisteredValidator: mockRegisteredValidator,
    });
  });

  describe("delete", () => {
    const inputId = "test-id-123";
    const sanitizedId = "sanitized-test-id-123";

    describe("successful deletion", () => {
      it("should delete vehicle when all validations pass", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.delete.mockResolvedValueOnce(undefined);

        await expect(sut.delete(inputId)).resolves.not.toThrow();

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.delete).toHaveBeenCalledWith(sanitizedId);
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

        mockRepository.delete.mockImplementationOnce(async () => {
          callOrder.push("delete");
        });

        await sut.delete(inputId);

        expect(callOrder).toEqual([
          "sanitize",
          "idValidate",
          "registeredValidate",
          "delete",
        ]);
      });
    });

    describe("failed deletion", () => {
      it("should throw error when sanitizer throws", async () => {
        const sanitizerError = new Error("Sanitizer error");
        mockSanitizer.sanitize.mockImplementationOnce(() => {
          throw sanitizerError;
        });

        await expect(sut.delete(inputId)).rejects.toThrow(sanitizerError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).not.toHaveBeenCalled();
        expect(mockRegisteredValidator.validate).not.toHaveBeenCalled();
        expect(mockRepository.delete).not.toHaveBeenCalled();
      });

      it("should throw error when id validator throws", async () => {
        const validatorError = new Error("ID Validator error");
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockImplementationOnce(() => {
          throw validatorError;
        });

        await expect(sut.delete(inputId)).rejects.toThrow(validatorError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).not.toHaveBeenCalled();
        expect(mockRepository.delete).not.toHaveBeenCalled();
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

        await expect(sut.delete(inputId)).rejects.toThrow(
          registeredValidatorError,
        );

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.delete).not.toHaveBeenCalled();
      });

      it("should throw error when repository throws", async () => {
        const repositoryError = new Error("Repository error");
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.delete.mockRejectedValueOnce(repositoryError);

        await expect(sut.delete(inputId)).rejects.toThrow(repositoryError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputId);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedId);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledWith(
          sanitizedId,
        );
        expect(mockRepository.delete).toHaveBeenCalledWith(sanitizedId);
      });
    });

    describe("method calls", () => {
      it("should call each dependency exactly once", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedId);
        mockValidator.validate.mockReturnValueOnce(undefined);
        mockRegisteredValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.delete.mockResolvedValueOnce(undefined);

        await sut.delete(inputId);

        expect(mockSanitizer.sanitize).toHaveBeenCalledTimes(1);
        expect(mockValidator.validate).toHaveBeenCalledTimes(1);
        expect(mockRegisteredValidator.validate).toHaveBeenCalledTimes(1);
        expect(mockRepository.delete).toHaveBeenCalledTimes(1);
      });
    });
  });
});
