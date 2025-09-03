import {
  mockFindByIdVehicleService,
  mockLogger,
} from "../../../../../__mocks__";
import { FindByIdVehicleController } from "../../../../../src/presentation/controllers";
import { Vehicle, VehicleSituation } from "../../../../../src/domain/entities";
import { HttpRequest } from "../../../../../src/presentation/protocols";
import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";

describe("FindByIdVehicleController", () => {
  let sut: FindByIdVehicleController;
  let mockedService = mockFindByIdVehicleService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new FindByIdVehicleController({
      findByIdVehicleService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validId = "valid-vehicle-id-123";
    const validRequest: HttpRequest = {
      params: { id: validId },
    };

    const mockVehicle: Vehicle = {
      id: validId,
      name: "Viatura Teste",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento teste",
    };

    it("should find vehicle by id successfully", async () => {
      mockedService.findById.mockResolvedValueOnce(mockVehicle);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: mockVehicle },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
      expect(mockedService.findById).toHaveBeenCalledTimes(1);
    });

    it("should return null when vehicle is not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { data: null },
        statusCode: 200,
      });
      expect(mockedService.findById).toHaveBeenCalledWith(validId);
    });

    it("should log info when receiving request", async () => {
      mockedService.findById.mockResolvedValueOnce(mockVehicle);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar viatura por ID",
        { params: { id: validId } },
      );
    });

    it("should log info when vehicle is found", async () => {
      mockedService.findById.mockResolvedValueOnce(mockVehicle);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viatura encontrada com sucesso",
        {
          id: validId,
          found: true,
        },
      );
    });

    it("should log info when vehicle is not found", async () => {
      mockedService.findById.mockResolvedValueOnce(null);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viatura encontrada com sucesso",
        {
          id: validId,
          found: false,
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest = {
        params: {},
      };

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is missing", async () => {
      const requestWithoutParams: HttpRequest = {};

      const result = await sut.handle(requestWithoutParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is empty", async () => {
      const requestWithEmptyId: HttpRequest = {
        params: { id: "" },
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is null", async () => {
      const requestWithNullId: HttpRequest = {
        params: { id: null as any },
      };

      const result = await sut.handle(requestWithNullId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.findById).not.toHaveBeenCalled();
    });

    describe("error handling", () => {
      it("should handle EntityNotFoundError", async () => {
        const error = new EntityNotFoundError("Viatura");
        mockedService.findById.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Viatura não encontrado(a) com esse ID." },
          statusCode: 404,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao listar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle InvalidParamError", async () => {
        const error = new InvalidParamError("id", "ID inválido");
        mockedService.findById.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "O campo id é inválido: ID inválido." },
          statusCode: 422,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao listar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle generic errors", async () => {
        const error = new Error("Erro genérico");
        mockedService.findById.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao listar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle unexpected errors", async () => {
        mockedService.findById.mockRejectedValueOnce("String error");

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao listar viatura",
          expect.objectContaining({
            error: "String error",
            requestData: { id: validId },
          }),
        );
      });
    });

    describe("service integration", () => {
      it("should call service with correct id", async () => {
        mockedService.findById.mockResolvedValueOnce(mockVehicle);

        await sut.handle(validRequest);

        expect(mockedService.findById).toHaveBeenCalledWith(validId);
        expect(mockedService.findById).toHaveBeenCalledTimes(1);
      });

      it("should not call service when validation fails", async () => {
        await sut.handle({});

        expect(mockedService.findById).not.toHaveBeenCalled();
      });
    });

    describe("logging integration", () => {
      it("should log all required information on success", async () => {
        mockedService.findById.mockResolvedValueOnce(mockVehicle);

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(2);
        expect(mockedLogger.error).not.toHaveBeenCalled();
      });

      it("should log error information on failure", async () => {
        const error = new Error("Service error");
        mockedService.findById.mockRejectedValueOnce(error);

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      });

      it("should not log success when validation fails", async () => {
        await sut.handle({});

        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          "Viatura encontrada com sucesso",
          expect.anything(),
        );
      });
    });
  });
});
