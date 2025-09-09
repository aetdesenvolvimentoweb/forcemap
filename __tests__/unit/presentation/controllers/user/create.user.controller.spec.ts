import { mockCreateUserService, mockLogger } from "../../../../../__mocks__";
import {
  DuplicatedKeyError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { UserInputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { CreateUserController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("CreateUserController", () => {
  let sut: CreateUserController;
  let mockedService = mockCreateUserService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new CreateUserController({
      createUserService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: UserInputDTO = {
      militaryId: "military-123",
      role: UserRole.ADMIN,
      password: "strongPassword123",
    };

    const validRequest: HttpRequest<UserInputDTO> = {
      body: validBody,
    };

    it("should create user successfully with valid data", async () => {
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
        "Recebida requisição para criar usuário",
        {
          body: {
            militaryId: validBody.militaryId,
            role: validBody.role,
            password: "senha oculta",
          },
        },
      );
    });

    it("should log info when user is created successfully", async () => {
      mockedService.create.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário criado com sucesso",
        {
          militaryId: validBody.militaryId,
          role: validBody.role,
          password: "senha oculta",
        },
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<UserInputDTO> = {};

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<UserInputDTO> = {
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
      const requestWithUndefinedBody: HttpRequest<UserInputDTO> = {
        body: undefined,
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.create).not.toHaveBeenCalled();
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<UserInputDTO> = {};

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new DuplicatedKeyError("militaryId");
      mockedService.create.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError("role", "formato inválido");
      mockedService.create.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith("Erro ao criar usuário", {
        error: serviceError,
        requestData: validBody,
      });
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.create.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.create).toHaveBeenCalledWith(validBody);
    });

    it("should handle concurrent requests independently", async () => {
      const body1: UserInputDTO = {
        militaryId: "military-111",
        role: UserRole.BOMBEIRO,
        password: "password111",
      };
      const body2: UserInputDTO = {
        militaryId: "military-222",
        role: UserRole.ADMIN,
        password: "password222",
      };

      const request1: HttpRequest<UserInputDTO> = { body: body1 };
      const request2: HttpRequest<UserInputDTO> = { body: body2 };

      mockedService.create.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 201 });
      expect(result2).toEqual({ statusCode: 201 });
      expect(mockedService.create).toHaveBeenCalledTimes(2);
      expect(mockedService.create).toHaveBeenNthCalledWith(1, body1);
      expect(mockedService.create).toHaveBeenNthCalledWith(2, body2);
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: UserInputDTO = {
        militaryId: "military-789",
        role: UserRole.ADMIN,
        password: "complexPassword456",
      };

      const request: HttpRequest<UserInputDTO> = {
        body: complexBody,
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.create).toHaveBeenCalledWith(complexBody);

      const calledWith = mockedService.create.mock.calls[0][0];
      expect(calledWith).toHaveProperty("militaryId");
      expect(calledWith).toHaveProperty("role");
      expect(calledWith).toHaveProperty("password");
      expect(typeof calledWith.militaryId).toBe("string");
      expect(typeof calledWith.role).toBe("string");
      expect(typeof calledWith.password).toBe("string");
    });

    it("should not modify the original request body", async () => {
      const originalBody: UserInputDTO = {
        militaryId: "military-999",
        role: UserRole.CHEFE,
        password: "originalPassword",
      };

      const request: HttpRequest<UserInputDTO> = {
        body: { ...originalBody },
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });

    it("should handle different user roles correctly", async () => {
      const adminUserBody: UserInputDTO = {
        militaryId: "admin-001",
        role: UserRole.ADMIN,
        password: "adminPassword",
      };

      const regularUserBody: UserInputDTO = {
        militaryId: "user-001",
        role: UserRole.BOMBEIRO,
        password: "userPassword",
      };

      mockedService.create.mockResolvedValue();

      await sut.handle({ body: adminUserBody });
      await sut.handle({ body: regularUserBody });

      expect(mockedService.create).toHaveBeenCalledTimes(2);
      expect(mockedService.create).toHaveBeenNthCalledWith(1, adminUserBody);
      expect(mockedService.create).toHaveBeenNthCalledWith(2, regularUserBody);
    });

    it("should mask password in logs consistently", async () => {
      const sensitiveBody: UserInputDTO = {
        militaryId: "secure-001",
        role: UserRole.ADMIN,
        password: "verySensitivePassword123!@#",
      };

      mockedService.create.mockResolvedValueOnce();

      await sut.handle({ body: sensitiveBody });

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para criar usuário",
        {
          body: {
            militaryId: sensitiveBody.militaryId,
            role: sensitiveBody.role,
            password: "senha oculta",
          },
        },
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuário criado com sucesso",
        {
          militaryId: sensitiveBody.militaryId,
          role: sensitiveBody.role,
          password: "senha oculta",
        },
      );
    });
  });
});
