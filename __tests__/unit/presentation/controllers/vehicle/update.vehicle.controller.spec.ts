import { mockLogger, mockUpdateVehicleService } from "../../../../../__mocks__";
import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { VehicleInputDTO } from "../../../../../src/domain/dtos";
import { VehicleSituation } from "../../../../../src/domain/entities";
import { UpdateVehicleController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("UpdateVehicleController", () => {
  let sut: UpdateVehicleController;
  let mockedService = mockUpdateVehicleService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new UpdateVehicleController({
      updateVehicleService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validId = "valid-vehicle-id-123";
    const validBody: VehicleInputDTO = {
      name: "Viatura Atualizada",
      situation: VehicleSituation.BAIXADA,
      complement: "Complemento atualizado",
    };

    const validRequest: HttpRequest<VehicleInputDTO> = {
      params: { id: validId },
      body: validBody,
    };

    it("should update vehicle successfully with valid data", async () => {
      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
      expect(mockedService.update).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.update.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para atualizar viatura",
        {
          params: { id: validId },
          body: validBody,
        },
      );
    });

    it("should log info when vehicle is updated successfully", async () => {
      mockedService.update.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viatura atualizada com sucesso",
        {
          id: validId,
          name: validBody.name,
          situation: validBody.situation,
          complement: validBody.complement,
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<VehicleInputDTO> = {
        body: validBody,
      };

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<VehicleInputDTO> = {
        params: { id: validId },
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when both id and body are missing", async () => {
      const emptyRequest: HttpRequest<VehicleInputDTO> = {};

      const result = await sut.handle(emptyRequest);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when id param is empty", async () => {
      const requestWithEmptyId: HttpRequest<VehicleInputDTO> = {
        params: { id: "" },
        body: validBody,
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<VehicleInputDTO> = {
        params: { id: validId },
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.update).not.toHaveBeenCalled();
    });

    it("should update vehicle without complement", async () => {
      const bodyWithoutComplement: VehicleInputDTO = {
        name: "Viatura Sem Complemento",
        situation: VehicleSituation.ATIVA,
      };

      const requestWithoutComplement: HttpRequest<VehicleInputDTO> = {
        params: { id: validId },
        body: bodyWithoutComplement,
      };

      mockedService.update.mockResolvedValueOnce();

      const result = await sut.handle(requestWithoutComplement);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.update).toHaveBeenCalledWith(
        validId,
        bodyWithoutComplement,
      );
    });

    describe("error handling", () => {
      it("should handle EntityNotFoundError", async () => {
        const error = new EntityNotFoundError("Viatura");
        mockedService.update.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Viatura não encontrado(a) com esse ID." },
          statusCode: 404,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao atualizar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId, data: validBody },
          }),
        );
      });

      it("should handle InvalidParamError", async () => {
        const error = new InvalidParamError("situation", "Situação inválida");
        mockedService.update.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "O campo situation é inválido: Situação inválida." },
          statusCode: 422,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao atualizar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId, data: validBody },
          }),
        );
      });

      it("should handle generic errors", async () => {
        const error = new Error("Erro genérico");
        mockedService.update.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao atualizar viatura",
          expect.objectContaining({
            error: error,
            requestData: { id: validId, data: validBody },
          }),
        );
      });

      it("should handle unexpected errors", async () => {
        mockedService.update.mockRejectedValueOnce("String error");

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao atualizar viatura",
          expect.objectContaining({
            error: "String error",
            requestData: { id: validId, data: validBody },
          }),
        );
      });
    });

    describe("service integration", () => {
      it("should call service with correct parameters", async () => {
        mockedService.update.mockResolvedValueOnce();

        await sut.handle(validRequest);

        expect(mockedService.update).toHaveBeenCalledWith(validId, validBody);
        expect(mockedService.update).toHaveBeenCalledTimes(1);
      });

      it("should not call service when id validation fails", async () => {
        const requestWithoutId: HttpRequest<VehicleInputDTO> = {
          body: validBody,
        };

        await sut.handle(requestWithoutId);

        expect(mockedService.update).not.toHaveBeenCalled();
      });

      it("should not call service when body validation fails", async () => {
        const requestWithoutBody: HttpRequest<VehicleInputDTO> = {
          params: { id: validId },
        };

        await sut.handle(requestWithoutBody);

        expect(mockedService.update).not.toHaveBeenCalled();
      });
    });

    describe("logging integration", () => {
      it("should log all required information on success", async () => {
        mockedService.update.mockResolvedValueOnce();

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(2);
        expect(mockedLogger.error).not.toHaveBeenCalled();
      });

      it("should log error information on failure", async () => {
        const error = new Error("Service error");
        mockedService.update.mockRejectedValueOnce(error);

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      });

      it("should not log success when validation fails", async () => {
        await sut.handle({});

        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          "Viatura atualizada com sucesso",
          expect.anything(),
        );
      });
    });

    describe("validation order", () => {
      it("should validate id before body", async () => {
        const requestWithoutId: HttpRequest<VehicleInputDTO> = {
          body: validBody,
        };

        await sut.handle(requestWithoutId);

        expect(mockedService.update).not.toHaveBeenCalled();
        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
      });

      it("should validate both id and body", async () => {
        const requestWithEmptyId: HttpRequest<VehicleInputDTO> = {
          params: { id: "" },
          body: null as any,
        };

        await sut.handle(requestWithEmptyId);

        expect(mockedService.update).not.toHaveBeenCalled();
        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
      });
    });
  });
});
