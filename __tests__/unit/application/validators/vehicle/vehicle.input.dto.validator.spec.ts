import { mockVehicleRepository } from "../../../../../__mocks__";
import {
  DuplicatedKeyError,
  InvalidParamError,
  MissingParamError,
} from "../../../../../src/application/errors";
import { VehicleInputDTOValidator } from "../../../../../src/application/validators";
import { VehicleInputDTO } from "../../../../../src/domain/dtos";
import { Vehicle, VehicleSituation } from "../../../../../src/domain/entities";

describe("VehicleInputDTOValidator", () => {
  let sut: VehicleInputDTOValidator;
  let mockedVehicleRepository = mockVehicleRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new VehicleInputDTOValidator({
      VehicleRepository: mockedVehicleRepository,
    });
  });

  describe("validate", () => {
    const validData: VehicleInputDTO = {
      name: "VIATURA-001",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento teste",
    };

    describe("successful validation", () => {
      it("should not throw when all data is valid and unique", async () => {
        mockedVehicleRepository.findByName.mockResolvedValueOnce(null);

        await expect(sut.validate(validData)).resolves.not.toThrow();
      });

      it("should not throw when complement is not provided", async () => {
        const dataWithoutComplement: VehicleInputDTO = {
          name: "VIATURA-002",
          situation: VehicleSituation.BAIXADA,
        };
        mockedVehicleRepository.findByName.mockResolvedValueOnce(null);

        await expect(
          sut.validate(dataWithoutComplement),
        ).resolves.not.toThrow();
      });

      it("should not throw when updating with same name (idToIgnore provided)", async () => {
        const existingVehicle: Vehicle = {
          id: "existing-id",
          name: validData.name,
          situation: VehicleSituation.ATIVA,
        };
        mockedVehicleRepository.findByName.mockResolvedValueOnce(
          existingVehicle,
        );

        await expect(
          sut.validate(validData, "existing-id"),
        ).resolves.not.toThrow();
      });
    });

    describe("name validation", () => {
      it("should throw MissingParamError when name is not provided", async () => {
        const invalidData = { ...validData, name: "" };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new MissingParamError("Nome"),
        );
      });

      it("should throw InvalidParamError when name exceeds 50 characters", async () => {
        const invalidData = { ...validData, name: "A".repeat(51) };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new InvalidParamError("Nome", "não pode exceder 50 caracteres"),
        );
      });

      it("should throw InvalidParamError when name has invalid format", async () => {
        const invalidData = { ...validData, name: "viatura-001" };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new InvalidParamError(
            "Nome",
            "deve conter apenas letras maíusculas, números, espaços e/ou hífens",
          ),
        );
      });

      it("should throw DuplicatedKeyError when name already exists", async () => {
        const existingVehicle: Vehicle = {
          id: "other-id",
          name: validData.name,
          situation: VehicleSituation.ATIVA,
        };
        mockedVehicleRepository.findByName.mockResolvedValueOnce(
          existingVehicle,
        );

        await expect(sut.validate(validData)).rejects.toThrow(
          new DuplicatedKeyError("Nome"),
        );
      });
    });

    describe("situation validation", () => {
      it("should throw MissingParamError when situation is not provided", async () => {
        const invalidData = { ...validData, situation: "" as any };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new MissingParamError("Situação"),
        );
      });

      it("should throw InvalidParamError when situation is invalid", async () => {
        const invalidData = { ...validData, situation: "INVALID" as any };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new InvalidParamError("Situação", "valor inválido"),
        );
      });
    });

    describe("complement validation", () => {
      it("should throw InvalidParamError when complement exceeds 100 characters", async () => {
        const invalidData = { ...validData, complement: "A".repeat(101) };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new InvalidParamError(
            "Complemento",
            "não pode exceder 100 caracteres",
          ),
        );
      });

      it("should throw InvalidParamError when complement has invalid format", async () => {
        const invalidData = { ...validData, complement: "complemento@#$" };

        await expect(sut.validate(invalidData)).rejects.toThrow(
          new InvalidParamError(
            "Complemento",
            "deve conter apenas letras, números e espaços",
          ),
        );
      });
    });
  });
});
