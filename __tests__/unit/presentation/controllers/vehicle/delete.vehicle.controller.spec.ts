import { mockDeleteVehicleService, mockLogger } from "../../../../../__mocks__";
import {
  EntityNotFoundError,
  InvalidParamError,
  ResourceInUseError,
} from "../../../../../src/application/errors";
import { DeleteVehicleController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("DeleteVehicleController", () => {
  let sut: DeleteVehicleController;
  let mockedService = mockDeleteVehicleService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new DeleteVehicleController({
      deleteVehicleService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validId = "valid-vehicle-id-123";
    const validRequest: HttpRequest = {
      params: { id: validId },
    };

    it("should delete vehicle successfully with valid id", async () => {
      mockedService.delete.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.delete).toHaveBeenCalledWith(validId);
      expect(mockedService.delete).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para deletar viatura",
      );
    });

    it("should log info when vehicle is deleted successfully", async () => {
      mockedService.delete.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viatura deletada com sucesso",
        { id: validId },
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
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is missing", async () => {
      const requestWithoutParams: HttpRequest = {};

      const result = await sut.handle(requestWithoutParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
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
      expect(mockedService.delete).not.toHaveBeenCalled();
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
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is undefined", async () => {
      const requestWithUndefinedId: HttpRequest = {
        params: { id: undefined as any },
      };

      const result = await sut.handle(requestWithUndefinedId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.delete).not.toHaveBeenCalled();
    });

    describe("error handling", () => {
      it("should handle EntityNotFoundError", async () => {
        const error = new EntityNotFoundError("Viatura");
        mockedService.delete.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Viatura não encontrado(a) com esse ID." },
          statusCode: 404,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao deletar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle InvalidParamError", async () => {
        const error = new InvalidParamError("id", "ID inválido");
        mockedService.delete.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "O campo id é inválido: ID inválido." },
          statusCode: 422,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao deletar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle ResourceInUseError", async () => {
        const error = new ResourceInUseError("Viatura", "outros recursos");
        mockedService.delete.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: {
            error:
              "Viatura não pode ser excluído(a) pois está sendo utilizado(a) por outros recursos.",
          },
          statusCode: 409,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao deletar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle generic errors", async () => {
        const error = new Error("Erro genérico");
        mockedService.delete.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao deletar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId },
          }),
        );
      });

      it("should handle unexpected errors", async () => {
        mockedService.delete.mockRejectedValueOnce("String error");

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao deletar viatura",
          expect.objectContaining({
            error: "String error",
            requestData: { id: validId },
          }),
        );
      });
    });

    describe("service integration", () => {
      it("should call service with correct id", async () => {
        mockedService.delete.mockResolvedValueOnce();

        await sut.handle(validRequest);

        expect(mockedService.delete).toHaveBeenCalledWith(validId);
        expect(mockedService.delete).toHaveBeenCalledTimes(1);
      });

      it("should not call service when validation fails", async () => {
        await sut.handle({});

        expect(mockedService.delete).not.toHaveBeenCalled();
      });
    });

    describe("logging integration", () => {
      it("should log all required information on success", async () => {
        mockedService.delete.mockResolvedValueOnce();

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(2);
        expect(mockedLogger.error).not.toHaveBeenCalled();
      });

      it("should log error information on failure", async () => {
        const error = new Error("Service error");
        mockedService.delete.mockRejectedValueOnce(error);

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      });

      it("should not log success when validation fails", async () => {
        await sut.handle({});

        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          "Viatura deletada com sucesso",
          expect.anything(),
        );
      });

      it("should log initial request even when validation fails", async () => {
        await sut.handle({});

        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Recebida requisição para deletar viatura",
        );
      });

      it("should not log success when service fails", async () => {
        const error = new Error("Service error");
        mockedService.delete.mockRejectedValueOnce(error);

        await sut.handle(validRequest);

        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          "Viatura deletada com sucesso",
          expect.anything(),
        );
      });
    });

    describe("response format", () => {
      it("should return no content status code on success", async () => {
        mockedService.delete.mockResolvedValueOnce();

        const result = await sut.handle(validRequest);

        expect(result.statusCode).toBe(204);
        expect(result.body).toBeUndefined();
      });

      it("should return error response with proper format on failure", async () => {
        const error = new EntityNotFoundError("Viatura");
        mockedService.delete.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toHaveProperty("statusCode");
        expect(result).toHaveProperty("body");
        expect(result.body).toHaveProperty("error");
      });
    });

    describe("parameter validation", () => {
      it("should handle different types of invalid id parameters", async () => {
        const invalidIdRequests = [
          { params: { id: "" } },
          { params: { id: null } },
          { params: { id: undefined } },
          { params: {} },
        ];

        for (const request of invalidIdRequests) {
          const result = await sut.handle(request as any);

          expect(result.statusCode).toBe(422);
          expect(mockedService.delete).not.toHaveBeenCalled();
        }

        expect(mockedService.delete).toHaveBeenCalledTimes(0);
      });

      it("should accept valid string id", async () => {
        const validStringIds = [
          "123",
          "abc-123",
          "uuid-format-id-123",
          "vehicle_id_1",
        ];

        for (const id of validStringIds) {
          jest.clearAllMocks();
          mockedService.delete.mockResolvedValue();
          const request = { params: { id } };

          const result = await sut.handle(request);

          expect(result.statusCode).toBe(204);
          expect(mockedService.delete).toHaveBeenCalledWith(id);
        }
      });
    });
  });
});
