import {
  mockVehicleRepository,
  mockVehicleInputDTOSanitizer,
  mockVehicleInputDTOValidator,
} from "../../../../../__mocks__";
import { CreateVehicleService } from "../../../../../src/application/services/vehicle/create.vehicle.service";
import { VehicleInputDTO } from "../../../../../src/domain/dtos";
import { VehicleSituation } from "../../../../../src/domain/entities";

describe("CreateVehicleService", () => {
  let sut: CreateVehicleService;
  let mockRepository = mockVehicleRepository();
  let mockSanitizer = mockVehicleInputDTOSanitizer();
  let mockValidator = mockVehicleInputDTOValidator();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateVehicleService({
      vehicleRepository: mockRepository,
      sanitizer: mockSanitizer,
      validator: mockValidator,
    });
  });

  describe("create", () => {
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

    describe("successful creation", () => {
      it("should create vehicle when all validations pass", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
        mockValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.create.mockResolvedValueOnce(undefined);

        await expect(sut.create(inputData)).resolves.not.toThrow();

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputData);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedData);
        expect(mockRepository.create).toHaveBeenCalledWith(sanitizedData);
      });

      it("should call sanitizer, validator and repository in correct order", async () => {
        const callOrder: string[] = [];

        mockSanitizer.sanitize.mockImplementationOnce((data) => {
          callOrder.push("sanitize");
          return data;
        });

        mockValidator.validate.mockImplementationOnce(async () => {
          callOrder.push("validate");
        });

        mockRepository.create.mockImplementationOnce(async () => {
          callOrder.push("create");
        });

        await sut.create(inputData);

        expect(callOrder).toEqual(["sanitize", "validate", "create"]);
      });
    });

    describe("failed creation", () => {
      it("should throw error when sanitizer throws", async () => {
        const sanitizerError = new Error("Sanitizer error");
        mockSanitizer.sanitize.mockImplementationOnce(() => {
          throw sanitizerError;
        });

        await expect(sut.create(inputData)).rejects.toThrow(sanitizerError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputData);
        expect(mockValidator.validate).not.toHaveBeenCalled();
        expect(mockRepository.create).not.toHaveBeenCalled();
      });

      it("should throw error when validator throws", async () => {
        const validatorError = new Error("Validator error");
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
        mockValidator.validate.mockRejectedValueOnce(validatorError);

        await expect(sut.create(inputData)).rejects.toThrow(validatorError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputData);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedData);
        expect(mockRepository.create).not.toHaveBeenCalled();
      });

      it("should throw error when repository throws", async () => {
        const repositoryError = new Error("Repository error");
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
        mockValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.create.mockRejectedValueOnce(repositoryError);

        await expect(sut.create(inputData)).rejects.toThrow(repositoryError);

        expect(mockSanitizer.sanitize).toHaveBeenCalledWith(inputData);
        expect(mockValidator.validate).toHaveBeenCalledWith(sanitizedData);
        expect(mockRepository.create).toHaveBeenCalledWith(sanitizedData);
      });
    });

    describe("method calls", () => {
      it("should call each dependency exactly once", async () => {
        mockSanitizer.sanitize.mockReturnValueOnce(sanitizedData);
        mockValidator.validate.mockResolvedValueOnce(undefined);
        mockRepository.create.mockResolvedValueOnce(undefined);

        await sut.create(inputData);

        expect(mockSanitizer.sanitize).toHaveBeenCalledTimes(1);
        expect(mockValidator.validate).toHaveBeenCalledTimes(1);
        expect(mockRepository.create).toHaveBeenCalledTimes(1);
      });
    });
  });
});
