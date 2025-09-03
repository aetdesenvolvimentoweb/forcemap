import { mockCreateVehicleService, mockLogger } from "../../../../../__mocks__";
import { CreateVehicleController } from "../../../../../src/presentation/controllers";
import { VehicleInputDTO } from "../../../../../src/domain/dtos";
import { VehicleSituation } from "../../../../../src/domain/entities";
import { HttpRequest } from "../../../../../src/presentation/protocols";
import {
  DuplicatedKeyError,
  InvalidParamError,
} from "../../../../../src/application/errors";

describe("CreateVehicleController", () => {
  let sut: CreateVehicleController;
  let mockedService = mockCreateVehicleService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateVehicleController({
      createVehicleService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: VehicleInputDTO = {
      name: "Viatura Teste",
      situation: VehicleSituation.ATIVA,
      complement: "Complemento opcional",
    };

    const validRequest: HttpRequest<VehicleInputDTO> = {
      body: validBody,
    };

    it("should create vehicle successfully with valid data", async () => {
      mockedService.create.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 201,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
      expect(mockedService.create).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.create.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para criar viatura",
        { body: validBody },
      );
    });

    it("should log info when vehicle is created successfully", async () => {
      mockedService.create.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Viatura criada com sucesso",
        {
          name: validBody.name,
          situation: validBody.situation,
          complement: validBody.complement,
        },
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<VehicleInputDTO> = {};

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<VehicleInputDTO> = {
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is undefined", async () => {
      const requestWithUndefinedBody: HttpRequest<VehicleInputDTO> = {
        body: undefined as any,
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should create vehicle without complement", async () => {
      const bodyWithoutComplement: VehicleInputDTO = {
        name: "Viatura Sem Complemento",
        situation: VehicleSituation.BAIXADA,
      };

      const requestWithoutComplement: HttpRequest<VehicleInputDTO> = {
        body: bodyWithoutComplement,
      };

      mockedService.create.mockResolvedValueOnce();

      const result = await sut.handle(requestWithoutComplement);

      expect(result).toEqual({
        statusCode: 201,
      });
      expect(mockedService.create).toHaveBeenCalledWith(bodyWithoutComplement);
    });

    describe("error handling", () => {
      it("should handle DuplicatedKeyError", async () => {
        const error = new DuplicatedKeyError("Viatura");
        mockedService.create.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Viatura já está em uso." },
          statusCode: 409,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao criar viatura",
          expect.objectContaining({
            error: error,
            requestData: validBody,
          }),
        );
      });

      it("should handle InvalidParamError", async () => {
        const error = new InvalidParamError("situation", "Situação inválida");
        mockedService.create.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "O campo situation é inválido: Situação inválida." },
          statusCode: 422,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao criar viatura",
          expect.objectContaining({
            error: error,
            requestData: validBody,
          }),
        );
      });

      it("should handle generic errors", async () => {
        const error = new Error("Erro genérico");
        mockedService.create.mockRejectedValueOnce(error);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao criar viatura",
          expect.objectContaining({
            error: error,
            requestData: validBody,
          }),
        );
      });

      it("should handle unexpected errors", async () => {
        mockedService.create.mockRejectedValueOnce("String error");

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          body: { error: "Erro interno no servidor." },
          statusCode: 500,
        });
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Erro ao criar viatura",
          expect.objectContaining({
            error: "String error",
            requestData: validBody,
          }),
        );
      });
    });

    describe("service integration", () => {
      it("should call service with correct parameters", async () => {
        mockedService.create.mockResolvedValueOnce();

        await sut.handle(validRequest);

        expect(mockedService.create).toHaveBeenCalledWith(validBody);
        expect(mockedService.create).toHaveBeenCalledTimes(1);
      });

      it("should not call service when validation fails", async () => {
        await sut.handle({});

        expect(mockedService.create).not.toHaveBeenCalled();
      });
    });

    describe("logging integration", () => {
      it("should log all required information on success", async () => {
        mockedService.create.mockResolvedValueOnce();

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(2);
        expect(mockedLogger.error).not.toHaveBeenCalled();
      });

      it("should log error information on failure", async () => {
        const error = new Error("Service error");
        mockedService.create.mockRejectedValueOnce(error);

        await sut.handle(validRequest);

        expect(mockedLogger.info).toHaveBeenCalledTimes(1);
        expect(mockedLogger.error).toHaveBeenCalledTimes(1);
      });

      it("should not log success when validation fails", async () => {
        await sut.handle({});

        expect(mockedLogger.info).not.toHaveBeenCalledWith(
          "Viatura criada com sucesso",
          expect.anything(),
        );
      });
    });
  });
});
