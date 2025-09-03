import { mockVehicleRepository } from "../../../../../__mocks__";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { VehicleIdRegisteredValidator } from "../../../../../src/application/validators";
import { Vehicle, VehicleSituation } from "../../../../../src/domain/entities";

describe("VehicleIdRegisteredValidator", () => {
  let sut: VehicleIdRegisteredValidator;
  let mockedVehicleRepository = mockVehicleRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new VehicleIdRegisteredValidator({
      vehicleRepository: mockedVehicleRepository,
    });
  });

  describe("validate", () => {
    const validId = "valid-vehicle-id";

    describe("successful validation", () => {
      it("should not throw when vehicle exists", async () => {
        const existingVehicle: Vehicle = {
          id: validId,
          name: "VIATURA-001",
          situation: VehicleSituation.ATIVA,
        };
        mockedVehicleRepository.findById.mockResolvedValueOnce(existingVehicle);

        await expect(sut.validate(validId)).resolves.not.toThrow();
      });
    });

    describe("failed validation", () => {
      it("should throw EntityNotFoundError when vehicle does not exist", async () => {
        mockedVehicleRepository.findById.mockResolvedValueOnce(null);

        await expect(sut.validate(validId)).rejects.toThrow(
          new EntityNotFoundError("Viatura"),
        );
      });

      it("should throw EntityNotFoundError when repository returns null", async () => {
        mockedVehicleRepository.findById.mockResolvedValueOnce(null);

        await expect(sut.validate(validId)).rejects.toThrow(
          new EntityNotFoundError("Viatura"),
        );
      });
    });

    describe("repository interaction", () => {
      it("should call repository findById with correct id", async () => {
        const existingVehicle: Vehicle = {
          id: validId,
          name: "VIATURA-001",
          situation: VehicleSituation.ATIVA,
        };
        mockedVehicleRepository.findById.mockResolvedValueOnce(existingVehicle);

        await sut.validate(validId);

        expect(mockedVehicleRepository.findById).toHaveBeenCalledWith(validId);
        expect(mockedVehicleRepository.findById).toHaveBeenCalledTimes(1);
      });
    });
  });
});
