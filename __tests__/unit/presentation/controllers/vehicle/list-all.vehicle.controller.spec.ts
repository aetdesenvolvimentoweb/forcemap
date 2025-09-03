import {
  mockListAllVehicleService,
  mockLogger,
} from "../../../../../__mocks__";
import { ListAllVehicleController } from "../../../../../src/presentation/controllers";
import { Vehicle, VehicleSituation } from "../../../../../src/domain/entities";

describe("ListAllVehicleController", () => {
  let sut: ListAllVehicleController;
  let mockedService = mockListAllVehicleService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllVehicleController({
      listAllVehicleService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const mockVehicles: Vehicle[] = [
      {
        id: "vehicle-1",
        name: "Viatura 01",
        situation: VehicleSituation.ATIVA,
        complement: "Complemento 1",
      },
      {
        id: "vehicle-2",
        name: "Viatura 02",
        situation: VehicleSituation.BAIXADA,
        complement: "Complemento 2",
      },
      {
        id: "vehicle-3",
        name: "Viatura 03",
        situation: VehicleSituation.ATIVA,
      },
    ];

    it("should list all vehicles successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockVehicles);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: mockVehicles },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
      expect(mockedService.listAll).toHaveBeenCalledWith();
    });

    it("should return empty array when no vehicles exist", async () => {
      mockedService.listAll.mockResolvedValueOnce([]);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: [] },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockVehicles);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar todas as viaturas",
      );
    });

    it("should log info when vehicles are listed successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockVehicles);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viaturas listadas com sucesso",
        {
          count: mockVehicles.length,
        },
      );
    });

    it("should log correct count when no vehicles exist", async () => {
      mockedService.listAll.mockResolvedValueOnce([]);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viaturas listadas com sucesso",
        {
          count: 0,
        },
      );
    });

    it("should log correct count for single vehicle", async () => {
      const singleVehicle = [mockVehicles[0]];
      mockedService.listAll.mockResolvedValueOnce(singleVehicle);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viaturas listadas com sucesso",
        {
          count: 1,
        },
      );
    });

    describe("error handling", () => {
      it("should handle generic errors", async () => {
        const error = new Error("Database connection failed");
        mockedService.listAll.mockRejectedValueOnce(error);

        const result = await sut.handle();

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao listar viaturas",
          expect.objectContaining({
            error: error,
            requestData: undefined,
          }),
        );
      });

      it("should handle unexpected errors", async () => {
        mockedService.listAll.mockRejectedValueOnce("String error");

        const result = await sut.handle();

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao listar viaturas",
          expect.objectContaining({
            error: "String error",
            requestData: undefined,
          }),
        );
      });
    });

    describe("service integration", () => {
      it("should call service without parameters", async () => {
        mockedService.listAll.mockResolvedValueOnce(mockVehicles);

        await sut.handle();

        expect(mockedService.listAll).toHaveBeenCalledWith();
        expect(mockedService.listAll).toHaveBeenCalledTimes(1);
      });
    });

    describe("logging integration", () => {
      it("should log all required information on success", async () => {
        mockedService.listAll.mockResolvedValueOnce(mockVehicles);

        await sut.handle();

        expect(mockedLogger.info).toHaveBeenCalledTimes(2);
        expect(mockedLogger.error).not.toHaveBeenCalled();
      });

      it("should log error information on failure", async () => {
        const error = new Error("Service error");
        mockedService.listAll.mockRejectedValueOnce(error);

        await sut.handle();

        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      });

      it("should log initial request even when service fails", async () => {
        const error = new Error("Service error");
        mockedService.listAll.mockRejectedValueOnce(error);

        await sut.handle();

        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Recebida requisição para listar todas as viaturas",
        );
      });

      it("should not log success message when service fails", async () => {
        const error = new Error("Service error");
        mockedService.listAll.mockRejectedValueOnce(error);

        await sut.handle();

        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          "Viaturas listadas com sucesso",
          expect.anything(),
        );
      });
    });

    describe("response format", () => {
      it("should return vehicles with correct structure", async () => {
        mockedService.listAll.mockResolvedValueOnce(mockVehicles);

        const result = await sut.handle();

        expect(result.body?.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              situation: expect.any(String),
            }),
          ]),
        );
      });

      it("should preserve vehicle complement when present", async () => {
        mockedService.listAll.mockResolvedValueOnce(mockVehicles);

        const result = await sut.handle();

        const vehicleWithComplement = (result.body?.data as Vehicle[]).find(
          (v) => v.complement,
        );
        expect(vehicleWithComplement?.complement).toBeDefined();
      });

      it("should handle vehicles without complement", async () => {
        mockedService.listAll.mockResolvedValueOnce(mockVehicles);

        const result = await sut.handle();

        const vehicleWithoutComplement = (result.body?.data as Vehicle[]).find(
          (v) => !v.complement,
        );
        expect(vehicleWithoutComplement).toBeDefined();
      });
    });
  });
});
