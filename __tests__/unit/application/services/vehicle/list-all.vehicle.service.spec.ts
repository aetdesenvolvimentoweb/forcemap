import { mockVehicleRepository } from "../../../../../__mocks__";
import { ListAllVehicleService } from "../../../../../src/application/services/vehicle/list-all.vehicle.service";
import { Vehicle, VehicleSituation } from "../../../../../src/domain/entities";

describe("ListAllVehicleService", () => {
  let sut: ListAllVehicleService;
  let mockRepository = mockVehicleRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllVehicleService({
      vehicleRepository: mockRepository,
    });
  });

  describe("listAll", () => {
    const mockVehicles: Vehicle[] = [
      {
        id: "1",
        name: "VIATURA-001",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento 1",
      },
      {
        id: "2",
        name: "VIATURA-002",
        situation: VehicleSituation.BAIXADA,
      },
      {
        id: "3",
        name: "VIATURA-003",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento 3",
      },
    ];

    describe("successful listing", () => {
      it("should return all vehicles when repository has data", async () => {
        mockRepository.listAll.mockResolvedValueOnce(mockVehicles);

        const result = await sut.listAll();

        expect(result).toEqual(mockVehicles);
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1);
      });

      it("should return empty array when no vehicles exist", async () => {
        mockRepository.listAll.mockResolvedValueOnce([]);

        const result = await sut.listAll();

        expect(result).toEqual([]);
        expect(mockRepository.listAll).toHaveBeenCalledTimes(1);
      });

      it("should call repository without any parameters", async () => {
        mockRepository.listAll.mockResolvedValueOnce(mockVehicles);

        await sut.listAll();

        expect(mockRepository.listAll).toHaveBeenCalledWith();
      });
    });

    describe("failed listing", () => {
      it("should throw error when repository throws", async () => {
        const repositoryError = new Error("Repository error");
        mockRepository.listAll.mockRejectedValueOnce(repositoryError);

        await expect(sut.listAll()).rejects.toThrow(repositoryError);

        expect(mockRepository.listAll).toHaveBeenCalledTimes(1);
      });
    });

    describe("method calls", () => {
      it("should call repository exactly once", async () => {
        mockRepository.listAll.mockResolvedValueOnce(mockVehicles);

        await sut.listAll();

        expect(mockRepository.listAll).toHaveBeenCalledTimes(1);
      });
    });
  });
});
