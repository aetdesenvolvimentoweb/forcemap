import {
  mockLogger,
  mockUpdateUserPasswordService,
} from "../../../../../__mocks__";
import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { UpdateUserInputDTO } from "../../../../../src/domain/dtos";
import { UpdateUserPasswordController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("UpdateUserPasswordController", () => {
  let sut: UpdateUserPasswordController;
  let mockedService: ReturnType<typeof mockUpdateUserPasswordService>;
  let mockedLogger: ReturnType<typeof mockLogger>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedService = mockUpdateUserPasswordService();
    mockedLogger = mockLogger();
    sut = new UpdateUserPasswordController({
      updateUserPasswordService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: UpdateUserInputDTO = {
      currentPassword: "currentPassword123",
      newPassword: "newPassword456",
    };

    const validRequest: HttpRequest<UpdateUserInputDTO> = {
      params: { id: "user-123" },
      body: validBody,
      user: {
        userId: "user-123",
        sessionId: "session-123",
        role: "ACA",
        militaryId: "military-123",
      },
    };

    it("should update user password successfully with valid data", async () => {
      mockedService.updateUserPassword.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-123",
        validBody,
      );
      expect(mockedService.updateUserPassword).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.updateUserPassword.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para atualizar senha do usuário",
        {
          params: validRequest.params,
          body: validRequest.body,
        },
      );
    });

    it("should log info when user password is updated successfully", async () => {
      mockedService.updateUserPassword.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Senha do usuário atualizada com sucesso",
        {
          id: "user-123",
          updatedBy: "user-123",
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<UpdateUserInputDTO> = {
        body: validBody,
      };

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-123" },
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should return empty request error when both id and body are missing", async () => {
      const emptyRequest: HttpRequest<UpdateUserInputDTO> = {};

      const result = await sut.handle(emptyRequest);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is null", async () => {
      const requestWithNullParams: HttpRequest<UpdateUserInputDTO> = {
        params: null as any,
        body: validBody,
      };

      const result = await sut.handle(requestWithNullParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-123" },
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<UpdateUserInputDTO> = {
        body: validBody,
      };

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-123" },
      };

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle not found error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("User");
      mockedService.updateUserPassword.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-123",
        validBody,
      );
    });

    it("should handle invalid current password error and return appropriate response", async () => {
      const serviceError = new InvalidParamError(
        "currentPassword",
        "senha atual incorreta",
      );
      mockedService.updateUserPassword.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-123",
        validBody,
      );
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError(
        "newPassword",
        "senha muito fraca",
      );
      mockedService.updateUserPassword.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao atualizar senha do usuário",
        {
          error: serviceError,
          requestData: { id: "user-123" },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.updateUserPassword.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-123",
        validBody,
      );
    });

    it("should handle concurrent update requests independently", async () => {
      const body1: UpdateUserInputDTO = {
        currentPassword: "currentPassword1",
        newPassword: "newPassword1",
      };
      const body2: UpdateUserInputDTO = {
        currentPassword: "currentPassword2",
        newPassword: "newPassword2",
      };

      const request1: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-1" },
        body: body1,
        user: {
          userId: "user-1",
          sessionId: "session-1",
          role: "ACA",
          militaryId: "military-1",
        },
      };
      const request2: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-2" },
        body: body2,
        user: {
          userId: "user-2",
          sessionId: "session-2",
          role: "ACA",
          militaryId: "military-2",
        },
      };

      mockedService.updateUserPassword.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 204 });
      expect(result2).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserPassword).toHaveBeenCalledTimes(2);
      expect(mockedService.updateUserPassword).toHaveBeenNthCalledWith(
        1,
        "user-1",
        body1,
      );
      expect(mockedService.updateUserPassword).toHaveBeenNthCalledWith(
        2,
        "user-2",
        body2,
      );
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: UpdateUserInputDTO = {
        currentPassword: "complexCurrentPassword123!@#",
        newPassword: "complexNewPassword456$%^",
      };

      const request: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-complex" },
        body: complexBody,
        user: {
          userId: "user-complex",
          sessionId: "session-complex",
          role: "ACA",
          militaryId: "military-complex",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      await sut.handle(request);

      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-complex",
        complexBody,
      );

      const [calledId, calledBody] =
        mockedService.updateUserPassword.mock.calls[0];
      expect(typeof calledId).toBe("string");
      expect(calledBody).toHaveProperty("currentPassword");
      expect(calledBody).toHaveProperty("newPassword");
      expect(typeof calledBody.currentPassword).toBe("string");
      expect(typeof calledBody.newPassword).toBe("string");
    });

    it("should not modify the original request data", async () => {
      const originalParams = { id: "user-123" };
      const originalBody: UpdateUserInputDTO = {
        currentPassword: "originalCurrentPassword",
        newPassword: "originalNewPassword",
      };

      const request: HttpRequest<UpdateUserInputDTO> = {
        params: { ...originalParams },
        body: { ...originalBody },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.params).toEqual(originalParams);
      expect(request.body).toEqual(originalBody);
    });

    it("should handle special characters in id correctly", async () => {
      const requestWithSpecialId: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-123-àáâã" },
        body: validBody,
        user: {
          userId: "user-123-àáâã",
          sessionId: "session-123",
          role: "ACA",
          militaryId: "military-123",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      const result = await sut.handle(requestWithSpecialId);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-123-àáâã",
        validBody,
      );
    });

    it("should handle empty string id as invalid", async () => {
      const requestWithEmptyId: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "" },
        body: validBody,
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
    });

    it("should handle complex password requirements", async () => {
      const complexPasswordBody: UpdateUserInputDTO = {
        currentPassword: "Current123!@#$%^&*()",
        newPassword: "NewPassword789!@#$%^&*()",
      };

      const requestWithComplexPasswords: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-456" },
        body: complexPasswordBody,
        user: {
          userId: "user-456",
          sessionId: "session-456",
          role: "ACA",
          militaryId: "military-456",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      const result = await sut.handle(requestWithComplexPasswords);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-456",
        complexPasswordBody,
      );
    });

    it("should handle password validation errors appropriately", async () => {
      const weakPasswordBody: UpdateUserInputDTO = {
        currentPassword: "currentPassword123",
        newPassword: "123", // weak password
      };

      const serviceError = new InvalidParamError(
        "newPassword",
        "A senha deve ter pelo menos 8 caracteres",
      );
      mockedService.updateUserPassword.mockRejectedValueOnce(serviceError);

      const result = await sut.handle({
        params: { id: "user-123" },
        body: weakPasswordBody,
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ACA",
          militaryId: "military-123",
        },
      });

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should handle same current and new password scenario", async () => {
      const samePasswordBody: UpdateUserInputDTO = {
        currentPassword: "samePassword123",
        newPassword: "samePassword123",
      };

      const serviceError = new InvalidParamError(
        "newPassword",
        "A nova senha deve ser diferente da senha atual",
      );
      mockedService.updateUserPassword.mockRejectedValueOnce(serviceError);

      const result = await sut.handle({
        params: { id: "user-123" },
        body: samePasswordBody,
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ACA",
          militaryId: "military-123",
        },
      });

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should maintain password security in logs", async () => {
      const sensitiveBody: UpdateUserInputDTO = {
        currentPassword: "verySensitiveCurrentPassword123!",
        newPassword: "verySensitiveNewPassword456!",
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      await sut.handle({
        params: { id: "user-sensitive" },
        body: sensitiveBody,
        user: {
          userId: "user-sensitive",
          sessionId: "session-sensitive",
          role: "ACA",
          militaryId: "military-sensitive",
        },
      });

      // Verify that password information is logged (as per the controller implementation)
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para atualizar senha do usuário",
        {
          params: { id: "user-sensitive" },
          body: sensitiveBody,
        },
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Senha do usuário atualizada com sucesso",
        {
          id: "user-sensitive",
          updatedBy: "user-sensitive",
        },
      );
    });

    it("should handle numeric string ids correctly", async () => {
      const numericIdRequest: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "12345" },
        body: validBody,
        user: {
          userId: "12345",
          sessionId: "session-123",
          role: "ACA",
          militaryId: "military-123",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      const result = await sut.handle(numericIdRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "12345",
        validBody,
      );
    });
  });

  describe("authorization", () => {
    const validBody: UpdateUserInputDTO = {
      currentPassword: "currentPassword123",
      newPassword: "newPassword456",
    };

    it("should return forbidden when user is not authenticated", async () => {
      const requestWithoutAuth: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-123" },
        body: validBody,
      };

      const result = await sut.handle(requestWithoutAuth);

      expect(result).toEqual({
        statusCode: 403,
        body: { error: "Usuário não autenticado" },
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Tentativa de atualizar senha sem autenticação",
        { id: "user-123" },
      );
    });

    it("should allow user to update their own password", async () => {
      const requestWithOwnUser: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-123" },
        body: validBody,
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ACA",
          militaryId: "military-123",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      const result = await sut.handle(requestWithOwnUser);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "user-123",
        validBody,
      );
    });

    it("should prevent user from updating another user's password", async () => {
      const requestWithDifferentUser: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-456" },
        body: validBody,
        user: {
          userId: "user-123",
          sessionId: "session-123",
          role: "ACA",
          militaryId: "military-123",
        },
      };

      const result = await sut.handle(requestWithDifferentUser);

      expect(result).toEqual({
        statusCode: 403,
        body: {
          error: "Você só pode alterar sua própria senha",
        },
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Usuário tentou alterar senha de outro usuário",
        {
          requestingUserId: "user-123",
          targetUserId: "user-456",
          role: "ACA",
        },
      );
    });

    it("should prevent Admin from updating another user's password (LGPD)", async () => {
      const adminRequest: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-456" },
        body: validBody,
        user: {
          userId: "admin-123",
          sessionId: "session-admin",
          role: "Admin",
          militaryId: "military-admin",
        },
      };

      const result = await sut.handle(adminRequest);

      expect(result).toEqual({
        statusCode: 403,
        body: {
          error: "Você só pode alterar sua própria senha",
        },
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Usuário tentou alterar senha de outro usuário",
        {
          requestingUserId: "admin-123",
          targetUserId: "user-456",
          role: "Admin",
        },
      );
    });

    it("should prevent Chefe from updating another user's password (LGPD)", async () => {
      const chefeRequest: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-789" },
        body: validBody,
        user: {
          userId: "chefe-123",
          sessionId: "session-chefe",
          role: "Chefe",
          militaryId: "military-chefe",
        },
      };

      const result = await sut.handle(chefeRequest);

      expect(result).toEqual({
        statusCode: 403,
        body: {
          error: "Você só pode alterar sua própria senha",
        },
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Usuário tentou alterar senha de outro usuário",
        {
          requestingUserId: "chefe-123",
          targetUserId: "user-789",
          role: "Chefe",
        },
      );
    });

    it("should prevent Sargento from updating another user's password", async () => {
      const sargentoRequest: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-999" },
        body: validBody,
        user: {
          userId: "sargento-123",
          sessionId: "session-sargento",
          role: "Sargento",
          militaryId: "military-sargento",
        },
      };

      const result = await sut.handle(sargentoRequest);

      expect(result).toEqual({
        statusCode: 403,
        body: {
          error: "Você só pode alterar sua própria senha",
        },
      });
      expect(mockedService.updateUserPassword).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Usuário tentou alterar senha de outro usuário",
        {
          requestingUserId: "sargento-123",
          targetUserId: "user-999",
          role: "Sargento",
        },
      );
    });

    it("should allow Sargento to update their own password", async () => {
      const sargentoOwnRequest: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "sargento-123" },
        body: validBody,
        user: {
          userId: "sargento-123",
          sessionId: "session-sargento",
          role: "Sargento",
          militaryId: "military-sargento",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      const result = await sut.handle(sargentoOwnRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserPassword).toHaveBeenCalledWith(
        "sargento-123",
        validBody,
      );
    });

    it("should log who updated their own password", async () => {
      const userRequest: HttpRequest<UpdateUserInputDTO> = {
        params: { id: "user-self-update" },
        body: validBody,
        user: {
          userId: "user-self-update",
          sessionId: "session-user",
          role: "ACA",
          militaryId: "military-user",
        },
      };

      mockedService.updateUserPassword.mockResolvedValueOnce();

      await sut.handle(userRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Senha do usuário atualizada com sucesso",
        {
          id: "user-self-update",
          updatedBy: "user-self-update",
        },
      );
    });
  });
});
